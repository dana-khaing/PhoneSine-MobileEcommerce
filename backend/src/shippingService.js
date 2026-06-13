const crypto = require("crypto");
const { OrderEvent, Shipment } = require("../models");
const { carrierRequest } = require("./providerService");
async function shippingRates(input) {
  if (process.env.CARRIER_API_URL) return carrierRequest("/rates", input);
  const { country, subtotalAmount = 0 } = input;
  const international = String(country).toUpperCase() !== "GB";
  return [
    { service: "standard", carrier: "PhoneSine Shipping", amount: subtotalAmount >= 100000 && !international ? 0 : international ? 2500 : 500, days: international ? "7-14" : "3-5" },
    { service: "express", carrier: "PhoneSine Express", amount: international ? 4500 : 1250, days: international ? "3-5" : "1-2" },
  ];
}
async function createShipment(order, input) {
  if (process.env.CARRIER_API_URL) {
    const label = await carrierRequest("/labels", { orderId: order.id, address: order.shippingAddress, ...input });
    return Shipment.create({ orderId: order.id, carrier: label.carrier, service: label.service, trackingNumber: label.trackingNumber, labelUrl: label.labelUrl });
  }
  const trackingNumber = `PS${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  return Shipment.create({ orderId: order.id, carrier: input.carrier || "PhoneSine Shipping", service: input.service || "standard", trackingNumber, labelUrl: `/shipping/labels/${trackingNumber}` });
}
async function updateShipment(shipment, status) {
  await shipment.update({ status });
  await OrderEvent.create({ orderId: shipment.orderId, type: `shipment_${status}`, message: `Shipment ${status.replaceAll("_", " ")}` });
  return shipment;
}
module.exports = { createShipment, shippingRates, updateShipment };
