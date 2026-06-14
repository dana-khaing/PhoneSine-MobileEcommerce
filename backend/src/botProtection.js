async function verifyBotToken(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) throw new Error("Bot verification required");

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error("Bot verification failed");
  return true;
}

module.exports = { verifyBotToken };
