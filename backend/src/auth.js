require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { Userdetail } = require("../models");
const { verifyBotToken } = require("./botProtection");
const {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
} = require("./authValidation");
const { issueEmailVerification, verifyEmailToken } = require("./emailVerificationService");
const { issuePasswordReset, resetPassword } = require("./passwordResetService");
const { createSession, listSessions, revokeSession, revokeSessionById, rotateSession } = require("./sessionService");
const { optionalAuth, requireAuth } = require("./authMiddleware");
const { clearSessionCookies, parseCookies, setSessionCookies } = require("./securityMiddleware");
const { generateSecret, provisioningUri, recoveryCodes, verifyCode } = require("./twoFactorService");
const { decrypt, encrypt } = require("./secretEncryption");
const { listLoginEvents, recordLoginEvent } = require("./loginSecurityService");
const { authorizationUrl, exchangeOAuthCode, resolveOAuthUser } = require("./oauthService");

function loginEvent(req, values) {
  return recordLoginEvent({
    email: normalizeEmail(req.body?.email || values.email),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    ...values,
  }).catch(() => {});
}

router.post("/register", async (req, res) => {
  try {
    await verifyBotToken(req.body.botToken, req.ip);
    const { firstname, lastname, email, password } = req.body;
    const validationError = validateRegistrationInput(req.body);

    if (validationError) {
      return res.status(400).send(validationError);
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await Userdetail.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await Userdetail.create({
      firstname: firstname,
      lastname: lastname,
      email: normalizedEmail,
      password: hashedPassword,
    });
    await issueEmailVerification(user);
    res.status(200).json({
      username: firstname + " " + lastname,
      email: normalizedEmail,
      verificationRequired: true,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    await verifyBotToken(req.body.botToken, req.ip);
    const validationError = validateLoginInput(req.body);

    if (validationError) {
      await loginEvent(req, { method: "password", successful: false, reason: validationError });
      return res.status(400).send(validationError);
    }

    const emailfinal = normalizeEmail(email);
    const currentUser = await Userdetail.findOne({ where: { email: emailfinal } });
    if (!currentUser) {
      await loginEvent(req, { method: "password", successful: false, reason: "User not found" });
      return res.status(400).send("User not found");
    }
    if (currentUser.lockedUntil && currentUser.lockedUntil > new Date()) {
      await loginEvent(req, { userId: currentUser.id, method: "password", successful: false, reason: "Account temporarily locked" });
      return res.status(423).send("Account temporarily locked");
    }
    const validPassword = await bcrypt.compare(password, currentUser.password);
    if (!validPassword) {
      const failedLoginAttempts = currentUser.failedLoginAttempts + 1;
      await currentUser.update({ failedLoginAttempts, lockedUntil: failedLoginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null });
      await loginEvent(req, { userId: currentUser.id, method: "password", successful: false, reason: "Invalid password" });
      return res.status(400).send("Invalid password");
    }
    if (currentUser.twoFactorEnabled && !verifyCode(decrypt(currentUser.twoFactorSecret), req.body.twoFactorCode)) {
      await loginEvent(req, { userId: currentUser.id, method: "password", successful: false, reason: "Two-factor code required" });
      return res.status(401).send("Two-factor code required");
    }
    if (!currentUser.emailVerifiedAt) {
      await loginEvent(req, { userId: currentUser.id, method: "password", successful: false, reason: "Email not verified" });
      return res.status(403).send("Verify your email before signing in");
    }
    await currentUser.update({ failedLoginAttempts: 0, lockedUntil: null });
    const session = await createSession(currentUser, {
      rememberMe,
      userAgent: req.headers["user-agent"],
    });
    setSessionCookies(res, session);
    await loginEvent(req, { userId: currentUser.id, method: "password", successful: true });
    return res.status(200).json(session);
  } catch (error) {
    await loginEvent(req, { method: "password", successful: false, reason: error.message });
    return res.status(400).send(error.message);
  }
});

router.get("/oauth/:provider/start", optionalAuth, (req, res) => {
  try {
    return res.redirect(authorizationUrl(req.params.provider, req.user?.userId));
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/oauth/:provider/callback", async (req, res) => {
  const storefront = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  try {
    const { profile, linkUserId } = await exchangeOAuthCode(req.params.provider, req.query.code, req.query.state);
    const user = await resolveOAuthUser(req.params.provider, profile, linkUserId);
    const session = await createSession(user, { userAgent: req.headers["user-agent"] });
    setSessionCookies(res, session);
    await loginEvent(req, { userId: user.id, email: user.email, method: req.params.provider, successful: true });
    return res.redirect(`${storefront}/?oauth=success`);
  } catch (error) {
    await loginEvent(req, { method: req.params.provider, successful: false, reason: error.message });
    return res.redirect(`${storefront}/?oauth=failed`);
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    await verifyEmailToken(req.body.token);
    return res.json({ verified: true });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const user = await Userdetail.findOne({ where: { email: normalizeEmail(req.body.email) } });
    if (user && !user.emailVerifiedAt) await issueEmailVerification(user);
    return res.json({ sent: true });
  } catch {
    return res.status(503).send("Unable to send verification email");
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const user = await Userdetail.findOne({ where: { email: normalizeEmail(req.body.email) } });
    if (user) await issuePasswordReset(user);
    return res.json({ sent: true });
  } catch {
    return res.status(503).send("Unable to send password reset email");
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    await resetPassword(req.body.token, req.body.password);
    return res.json({ reset: true });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const session = await rotateSession(req.body.refreshToken || parseCookies(req).refresh_token, req.headers["user-agent"]);
    setSessionCookies(res, session);
    return res.json(session);
  } catch (error) {
    return res.status(401).send(error.message);
  }
});

router.post("/logout", async (req, res) => {
  await revokeSession(req.body.refreshToken || parseCookies(req).refresh_token);
  clearSessionCookies(res);
  return res.status(204).end();
});
router.post("/two-factor/setup", requireAuth, async (req, res) => {
  const user = await Userdetail.findByPk(req.user.userId);
  const secret = generateSecret();
  const codes = recoveryCodes();
  await user.update({ twoFactorSecret: encrypt(secret), twoFactorEnabled: false, twoFactorRecoveryCodes: codes });
  res.json({ secret, provisioningUri: provisioningUri(user.email, secret), recoveryCodes: codes });
});
router.post("/two-factor/enable", requireAuth, async (req, res) => {
  const user = await Userdetail.findByPk(req.user.userId);
  if (!user.twoFactorSecret || !verifyCode(decrypt(user.twoFactorSecret), req.body.code)) return res.status(400).send("Invalid two-factor code");
  await user.update({ twoFactorEnabled: true });
  res.json({ enabled: true });
});
router.get("/sessions", requireAuth, async (req, res) => res.json(await listSessions(req.user.userId)));
router.get("/login-events", requireAuth, async (req, res) => res.json(await listLoginEvents(req.user.userId)));
router.delete("/sessions/:id", requireAuth, async (req, res) => { await revokeSessionById(req.user.userId, req.params.id); res.status(204).end(); });

module.exports = router;
