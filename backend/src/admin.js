const express = require("express");
const { Notification, Order, OrderEvent, OrderItem, Product } = require("../models");
const { requireAdmin } = require("./authMiddleware");
const {
  cancelOrRefundOrder,
  cleanupAbandonedOrders,
  updateFulfillment,
} = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");

const router = express.Router();
router.use(requireAdmin);

router.get("/orders", async (_req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: OrderItem, as: "items" },
      {
        model: OrderEvent,
        as: "events",
        separate: true,
        order: [["createdAt", "ASC"]],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json(orders);
});

router.patch("/orders/:id/fulfillment", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).send("Order not found");
    await updateFulfillment(order, req.body);
    return res.json(order);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/orders/:id/refund", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).send("Order not found");
    await cancelOrRefundOrder(order, "admin", req.body.amount);
    return res.json(order);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.patch("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).send("Product not found");
  const stockQuantity = req.body.stockQuantity ?? product.stockQuantity;
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    return res.status(400).send("Stock quantity must be a non-negative integer");
  }
  await product.update({
    stockQuantity,
    active: req.body.active ?? product.active,
  });
  res.json(product);
});

router.get("/products", async (_req, res) => {
  res.json(await Product.findAll({ order: [["name", "ASC"]] }));
});

router.post("/cleanup", async (_req, res) => {
  res.json({ cleaned: await cleanupAbandonedOrders() });
});

router.get("/notifications", async (_req, res) => {
  res.json(await Notification.findAll({ order: [["createdAt", "DESC"]] }));
});

router.post("/notifications/deliver", async (_req, res) => {
  res.json({ delivered: await deliverPendingNotifications() });
});

module.exports = router;
