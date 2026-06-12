require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { Userdetail } = require("../models");
const {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
} = require("./authValidation");
const { issueEmailVerification, verifyEmailToken } = require("./emailVerificationService");
const { issuePasswordReset, resetPassword } = require("./passwordResetService");
const { createSession, revokeSession, rotateSession } = require("./sessionService");
const { requireAuth } = require("./authMiddleware");
const { parseCookies, setSessionCookies } = require("./securityMiddleware");
const { generateSecret, verifyCode } = require("./twoFactorService");

router.post("/register", async (req, res) => {
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
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const validationError = validateLoginInput(req.body);

  if (validationError) {
    return res.status(400).send(validationError);
  }

  const emailfinal = normalizeEmail(email);
  const currentUser = await Userdetail.findOne({
    where: {
      email: emailfinal,
    },
  });
  if (!currentUser) return res.status(400).send("User not found");
  if (currentUser.lockedUntil && currentUser.lockedUntil > new Date()) return res.status(423).send("Account temporarily locked");
  const validPassword = await bcrypt.compare(password, currentUser.password);
  if (!validPassword) {
    const failedLoginAttempts = currentUser.failedLoginAttempts + 1;
    await currentUser.update({ failedLoginAttempts, lockedUntil: failedLoginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null });
    return res.status(400).send("Invalid password");
  }
  if (currentUser.twoFactorEnabled && !verifyCode(currentUser.twoFactorSecret, req.body.twoFactorCode)) return res.status(401).send("Two-factor code required");
  if (!currentUser.emailVerifiedAt) {
    return res.status(403).send("Verify your email before signing in");
  }
  await currentUser.update({ failedLoginAttempts: 0, lockedUntil: null });
  const session = await createSession(currentUser, {
    rememberMe,
    userAgent: req.headers["user-agent"],
  });
  setSessionCookies(res, session);
  res.status(200).json(session);
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
  return res.status(204).end();
});
router.post("/two-factor/setup", requireAuth, async (req, res) => {
  const user = await Userdetail.findByPk(req.user.userId);
  const secret = generateSecret();
  await user.update({ twoFactorSecret: secret, twoFactorEnabled: false });
  res.json({ secret });
});
router.post("/two-factor/enable", requireAuth, async (req, res) => {
  const user = await Userdetail.findByPk(req.user.userId);
  if (!user.twoFactorSecret || !verifyCode(user.twoFactorSecret, req.body.code)) return res.status(400).send("Invalid two-factor code");
  await user.update({ twoFactorEnabled: true });
  res.json({ enabled: true });
});

module.exports = router;
