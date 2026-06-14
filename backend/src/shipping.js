const express = require("express");
const { Order, Shipment } = require("../models");
const { requirePermission } = require("./authMiddleware");
const { createShipment, shippingRates, updateShipment } = require("./shippingService");
const router = express.Router();
router.post("/rates", async (req, res) => { try { res.json(await shippingRates(req.body)); } catch (error) { res.status(502).send(error.message); } });
router.post("/orders/:id", requirePermission("fulfillment.manage"), async (req, res) => {
  const order = await Order.findByPk(req.params.id); if (!order) return res.status(404).send("Order not found");
  res.status(201).json(await createShipment(order, req.body));
});
router.post("/webhook", async (req, res) => {
  if (process.env.SHIPPING_WEBHOOK_SECRET && req.headers["x-shipping-secret"] !== process.env.SHIPPING_WEBHOOK_SECRET) return res.status(401).send("Invalid shipping signature");
  const shipment = await Shipment.findOne({ where: { trackingNumber: req.body.trackingNumber } }); if (!shipment) return res.status(404).send("Shipment not found");
  res.json(await updateShipment(shipment, req.body.status));
});
router.get("/labels/:trackingNumber", requirePermission("fulfillment.manage"), async (req, res) => {
  const shipment = await Shipment.findOne({ where: { trackingNumber: req.params.trackingNumber } }); if (!shipment) return res.status(404).send("Shipment not found");
  res.type("text/plain").send(`PHONE SINE SHIPPING LABEL\n${shipment.carrier}\n${shipment.service}\n${shipment.trackingNumber}`);
});
module.exports = router;
