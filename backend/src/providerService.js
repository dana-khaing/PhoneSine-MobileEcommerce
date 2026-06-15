async function providerRequest(url, options, label) {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `${label} provider rejected request`);
  return result;
}
async function sendEmail({ to, subject, text }) {
  if (!process.env.RESEND_API_KEY) throw new Error("Resend is not configured");
  return providerRequest("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Phone Sine <orders@example.com>", to: [to], subject, text }),
  }, "Email");
}
async function sendSms({ to, text }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !from) throw new Error("Twilio is not configured");
  const body = new URLSearchParams({ To: to, From: from, Body: text });
  return providerRequest(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }, "SMS");
}
async function carrierRequest(path, body) {
  if (!process.env.CARRIER_API_URL || !process.env.CARRIER_API_KEY) throw new Error("Carrier provider is not configured");
  return providerRequest(`${process.env.CARRIER_API_URL}${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${process.env.CARRIER_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  }, "Carrier");
}
module.exports = { carrierRequest, sendEmail, sendSms };
