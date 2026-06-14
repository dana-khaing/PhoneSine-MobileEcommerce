const { CustomerAddress, sequelize } = require("../models");

function normalizeAddress(input) {
  const required = ["label", "recipientName", "line1", "city", "postalCode", "country"];
  if (required.some((field) => !String(input?.[field] || "").trim())) {
    throw new Error("Label, recipient, street, city, postal code, and country are required");
  }
  const country = String(input.country).trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new Error("Country must be a two-letter ISO code");
  return {
    label: String(input.label).trim(),
    recipientName: String(input.recipientName).trim(),
    line1: String(input.line1).trim(),
    line2: String(input.line2 || "").trim() || null,
    city: String(input.city).trim(),
    region: String(input.region || "").trim() || null,
    postalCode: String(input.postalCode).trim(),
    country,
    phone: String(input.phone || "").trim() || null,
    isDefault: input.isDefault === true,
  };
}

async function saveAddress(userId, input, address) {
  const values = normalizeAddress(input);
  return sequelize.transaction(async (transaction) => {
    if (values.isDefault) {
      await CustomerAddress.update({ isDefault: false }, { where: { userId }, transaction });
    }
    if (address) {
      await address.update(values, { transaction });
      return address;
    }
    const existingCount = await CustomerAddress.count({ where: { userId }, transaction });
    return CustomerAddress.create({ ...values, userId, isDefault: values.isDefault || existingCount === 0 }, { transaction });
  });
}

module.exports = { normalizeAddress, saveAddress };
