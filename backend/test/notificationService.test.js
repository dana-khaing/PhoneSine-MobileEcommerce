const test = require("node:test");
const assert = require("node:assert/strict");
const { smsRecipient } = require("../src/notificationService");

test("extracts SMS recipients from order shipping addresses", () => {
  assert.equal(smsRecipient({ shippingAddress: { phone: " +44 7000 " } }), "+44 7000");
  assert.equal(smsRecipient({ shippingAddress: JSON.stringify({ phone: "+1 555" }) }), "+1 555");
  assert.equal(smsRecipient({ shippingAddress: {} }), null);
});
