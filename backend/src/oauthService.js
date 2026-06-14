const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuthIdentity, Userdetail, sequelize } = require("../models");
const { normalizeEmail } = require("./authValidation");

const providers = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scopes: "openid email profile",
  },
  apple: {
    authorizeUrl: "https://appleid.apple.com/auth/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token",
    jwksUrl: "https://appleid.apple.com/auth/keys",
    issuer: "https://appleid.apple.com",
    scopes: "name email",
  },
};

function providerConfig(provider) {
  const defaults = providers[provider];
  if (!defaults) throw new Error("Unsupported OAuth provider");
  const prefix = `OAUTH_${provider.toUpperCase()}`;
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
  if (!clientId || !clientSecret) throw new Error(`${provider} OAuth is not configured`);
  return { ...defaults, clientId, clientSecret };
}

function callbackUrl(provider) {
  return `${process.env.BACKEND_ORIGIN || "http://localhost:8080"}/auth/oauth/${provider}/callback`;
}

function createState(provider, linkUserId) {
  return jwt.sign({ provider, linkUserId }, process.env.JWT_SECRET, { expiresIn: "10m" });
}

function authorizationUrl(provider, linkUserId) {
  const config = providerConfig(provider);
  const query = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(provider),
    response_type: "code",
    scope: config.scopes,
    state: createState(provider, linkUserId),
  });
  if (provider === "google") query.set("access_type", "offline");
  if (provider === "apple") query.set("response_mode", "query");
  return `${config.authorizeUrl}?${query}`;
}

async function verifiedAppleProfile(idToken, config) {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header?.kid) throw new Error("Apple identity token is invalid");
  const response = await fetch(config.jwksUrl);
  const { keys = [] } = await response.json();
  const key = keys.find((candidate) => candidate.kid === decoded.header.kid);
  if (!key) throw new Error("Apple signing key not found");
  const publicKey = crypto.createPublicKey({ key, format: "jwk" });
  return jwt.verify(idToken, publicKey, {
    algorithms: ["RS256"],
    audience: config.clientId,
    issuer: config.issuer,
  });
}

async function exchangeOAuthCode(provider, code, state) {
  const stateData = jwt.verify(state, process.env.JWT_SECRET);
  if (stateData.provider !== provider) throw new Error("OAuth state is invalid");
  const config = providerConfig(provider);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: callbackUrl(provider),
  });
  const tokenResponse = await fetch(config.tokenUrl, { method: "POST", body });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) throw new Error("OAuth code exchange failed");

  let profile;
  if (config.userInfoUrl) {
    const profileResponse = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    profile = await profileResponse.json();
    if (!profileResponse.ok) throw new Error("OAuth profile request failed");
  } else {
    profile = await verifiedAppleProfile(token.id_token, config);
  }
  if (!profile.sub || !profile.email || profile.email_verified === false) {
    throw new Error("OAuth provider did not return a verified email");
  }
  return { profile, linkUserId: stateData.linkUserId };
}

async function resolveOAuthUser(provider, profile, linkUserId) {
  return sequelize.transaction(async (transaction) => {
    const existingIdentity = await OAuthIdentity.findOne({
      where: { provider, subject: profile.sub },
      include: [{ association: "user" }],
      transaction,
    });
    if (existingIdentity) {
      if (linkUserId && existingIdentity.userId !== linkUserId) throw new Error("OAuth identity is linked to another account");
      return existingIdentity.user;
    }

    const email = normalizeEmail(profile.email);
    let user = linkUserId
      ? await Userdetail.findByPk(linkUserId, { transaction })
      : await Userdetail.findOne({ where: { email }, transaction });
    if (!user) {
      const names = String(profile.name || "").trim().split(/\s+/);
      user = await Userdetail.create({
        firstname: profile.given_name || names[0] || "Customer",
        lastname: profile.family_name || names.slice(1).join(" ") || "Account",
        email,
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        emailVerifiedAt: new Date(),
      }, { transaction });
    }
    if (!user) throw new Error("Account not found");
    await OAuthIdentity.create({ userId: user.id, provider, subject: profile.sub, email }, { transaction });
    return user;
  });
}

module.exports = { authorizationUrl, exchangeOAuthCode, resolveOAuthUser };
