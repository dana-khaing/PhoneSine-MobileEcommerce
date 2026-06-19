const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeAddress, normalizeNotificationPreferences } = require("../src/profileService");

test("normalizes international address-book entries", () => {
  assert.deepEqual(normalizeAddress({
    label: " Home ",
    recipientName: " Dana Khaing ",
    line1: " 1 Main Street ",
    city: " London ",
    postalCode: " SW1A 1AA ",
    country: " gb ",
    isDefault: true,
  }), {
    label: "Home",
    recipientName: "Dana Khaing",
    line1: "1 Main Street",
    line2: null,
    city: "London",
    region: null,
    postalCode: "SW1A 1AA",
    country: "GB",
    phone: null,
    isDefault: true,
  });
});

test("rejects incomplete or invalid address-book entries", () => {
  assert.throws(() => normalizeAddress({ country: "GB" }), /required/);
  assert.throws(() => normalizeAddress({ label: "Home", recipientName: "Dana", line1: "1 Main", city: "London", postalCode: "123", country: "United Kingdom" }), /two-letter ISO/);
});

test("normalizes notification preferences with safe defaults", () => {
  assert.deepEqual(normalizeNotificationPreferences({ sms: true, promotions: true, security: "yes" }), {
    email: true,
    sms: true,
    orderUpdates: true,
    promotions: true,
    security: true,
  });
});
