const express = require("express");
const { AuditLog, Notification, Order, OrderEvent, OrderItem, Product, Promotion, Refund, Userdetail } = require("../models");
const { requireAdmin } = require("./authMiddleware");
const {
  cancelOrRefundOrder,
  cleanupAbandonedOrders,
  updateFulfillment,
} = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { reconcilePayments } = require("./reconciliationService");
const { audit } = require("./auditService");
const { createProduct, updateProduct } = require("./productService");

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
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    await updateProduct(product, req.body);
    await audit(req.user.email, "product_updated", "product", product.id, req.body);
    return res.json(product);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/products", async (_req, res) => {
  res.json(await Product.findAll({ order: [["name", "ASC"]] }));
});

router.post("/products", async (req, res) => {
  try {
    const product = await createProduct(req.body);
    await audit(req.user.email, "product_created", "product", product.id, { name: product.name });
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).send("Product not found");
  await product.update({ active: false });
  await audit(req.user.email, "product_archived", "product", product.id);
  return res.status(204).end();
});

router.post("/products/:id/restore", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).send("Product not found");
  await product.update({ active: true });
  await audit(req.user.email, "product_restored", "product", product.id);
  return res.json(product);
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

router.get("/users", async (_req, res) => {
  res.json(await Userdetail.findAll({
    attributes: ["id", "firstname", "lastname", "email", "role", "emailVerifiedAt", "createdAt"],
    order: [["createdAt", "DESC"]],
  }));
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    if (!["admin", "customer"].includes(req.body.role)) throw new Error("Role must be admin or customer");
    const user = await Userdetail.findByPk(req.params.id);
    if (!user) return res.status(404).send("User not found");
    if (user.role === "admin" && req.body.role !== "admin") {
      const adminCount = await Userdetail.count({ where: { role: "admin" } });
      if (adminCount <= 1) throw new Error("Cannot remove the last admin");
    }
    await user.update({ role: req.body.role });
    await audit(req.user.email, "user_role_updated", "user", user.id, { role: user.role });
    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get("/notifications", async (_req, res) => {
  res.json(await Notification.findAll({ order: [["createdAt", "DESC"]] }));
});

router.post("/notifications/deliver", async (_req, res) => {
  res.json({ delivered: await deliverPendingNotifications() });
});

module.exports = router;
