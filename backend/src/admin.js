const express = require("express");
const { AuditLog, Notification, Order, OrderEvent, OrderItem, Product, Promotion, Refund } = require("../models");
const { requireAdmin } = require("./authMiddleware");
const {
  cancelOrRefundOrder,
  cleanupAbandonedOrders,
  updateFulfillment,
} = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { reconcilePayments } = require("./reconciliationService");
const { audit } = require("./auditService");

const router = express.Router();
router.use(requireAdmin);

router.get("/orders", async (_req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: OrderItem, as: "items" },
      { model: Refund, as: "refunds" },
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

router.post("/reconcile", async (_req, res) => {
  res.json({ results: await reconcilePayments() });
});

router.get("/audit-logs", async (_req, res) => {
  res.json(await AuditLog.findAll({ limit: 100, order: [["createdAt", "DESC"]] }));
});

router.get("/promotions", async (_req, res) => {
  res.json(await Promotion.findAll({ order: [["createdAt", "DESC"]] }));
});

router.post("/promotions", async (req, res) => {
  try {
    const percentOff = Number(req.body.percentOff);
    const maxUses = req.body.maxUses == null ? null : Number(req.body.maxUses);
    const perCustomerLimit = Number(req.body.perCustomerLimit || 1);
    if (!String(req.body.code || "").trim() || !Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
      throw new Error("Promotion code and percent between 1 and 100 are required");
    }
    if ((maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) || !Number.isInteger(perCustomerLimit) || perCustomerLimit < 1) {
      throw new Error("Promotion usage limits must be positive integers");
    }
    const promotion = await Promotion.create({
      code: String(req.body.code || "").trim().toUpperCase(),
      percentOff,
      maxUses,
      perCustomerLimit,
      expiresAt: req.body.expiresAt || null,
      active: req.body.active !== false,
    });
    await audit(req.user.email, "promotion_created", "promotion", promotion.id, { code: promotion.code });
    return res.status(201).json(promotion);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/health/payments", async (_req, res) => {
  const [pending, reviews, disputes, failedNotifications] = await Promise.all([
    Order.count({ where: { status: "pending" } }),
    Order.count({ where: { status: "payment_review" } }),
    Order.count({ where: { status: "disputed" } }),
    Notification.count({ where: { status: "failed" } }),
  ]);
  res.json({ pending, reviews, disputes, failedNotifications });
});

router.get("/notifications", async (_req, res) => {
  res.json(await Notification.findAll({ order: [["createdAt", "DESC"]] }));
});

router.post("/notifications/deliver", async (_req, res) => {
  res.json({ delivered: await deliverPendingNotifications() });
});

module.exports = router;
