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
async function carrierRequest(path, body) {
  if (!process.env.CARRIER_API_URL || !process.env.CARRIER_API_KEY) throw new Error("Carrier provider is not configured");
  return providerRequest(`${process.env.CARRIER_API_URL}${path}`, {
    method: "POST", headers: { Authorization: `Bearer ${process.env.CARRIER_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  }, "Carrier");
}
module.exports = { carrierRequest, sendEmail };
