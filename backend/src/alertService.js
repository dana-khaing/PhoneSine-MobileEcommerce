async function sendOperationalAlert(message, fields = {}) {
  if (!process.env.OPERATIONS_ALERT_WEBHOOK_URL) return false;
  const response = await fetch(process.env.OPERATIONS_ALERT_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...fields, timestamp: new Date().toISOString() }),
  });
  return response.ok;
}

module.exports = { sendOperationalAlert };
