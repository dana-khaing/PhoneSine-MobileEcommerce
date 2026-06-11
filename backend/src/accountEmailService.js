async function sendAccountEmail({ to, subject, text }) {
  if (process.env.EMAIL_WEBHOOK_URL) {
    const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text }),
    });
    if (!response.ok) throw new Error("Email provider rejected account email");
    return;
  }
  console.log(`[account-email:${to}] ${subject} ${text}`);
}

module.exports = { sendAccountEmail };
