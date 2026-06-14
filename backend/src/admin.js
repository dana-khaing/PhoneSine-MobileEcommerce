const crypto = require("crypto");
const express = require("express");
const { AuditLog, Category, GiftCard, Notification, Order, OrderEvent, OrderItem, Product, ProductBundle, ProductReview, ProductVariant, Promotion, Refund, ReturnRequest, SupportTicket, Userdetail } = require("../models");
const { requireAdminRequestPermission, requireStaff } = require("./authMiddleware");
const {
  cancelOrRefundOrder,
  cleanupAbandonedOrders,
  updateFulfillment,
} = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { reconcilePayments } = require("./reconciliationService");
const { audit } = require("./auditService");
const { createCategory, createProduct, createVariant, updateProduct, updateVariant } = require("./productService");
const { updateReturn } = require("./returnService");
const { operationsSummary, operationsSummaryToCsv, queueLowStockAlerts } = require("./operationsService");
const { parseProductCsv, productsToCsv } = require("./catalogueService");

const router = express.Router();
router.use(requireStaff);
router.use(requireAdminRequestPermission);

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
router.get("/returns", async (_req, res) => res.json(await ReturnRequest.findAll({ include: [{ model: Order }], order: [["createdAt", "DESC"]] })));
router.patch("/returns/:id", async (req, res) => {
  try {
    const request = await ReturnRequest.findByPk(req.params.id);
    if (!request) return res.status(404).send("Return not found");
    res.json(await updateReturn(request, req.body));
  } catch (error) { res.status(400).send(error.message); }
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
  res.json(await Product.findAll({
    include: [
      { association: "category" },
      { association: "images", separate: true, order: [["position", "ASC"]] },
      { association: "variants" },
    ],
    order: [["name", "ASC"]],
  }));
});

router.get("/categories", async (_req, res) => {
  res.json(await Category.findAll({ order: [["name", "ASC"]] }));
});

router.post("/categories", async (req, res) => {
  try {
    const category = await createCategory(req.body);
    await audit(req.user.email, "category_created", "category", category.id, { name: category.name });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/products/:id/variants", async (req, res) => {
  try {
    if (!await Product.findByPk(req.params.id)) return res.status(404).send("Product not found");
    const variant = await createVariant(req.params.id, req.body);
    await audit(req.user.email, "variant_created", "product_variant", variant.id, { sku: variant.sku });
    return res.status(201).json(variant);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.patch("/products/:productId/variants/:id", async (req, res) => {
  try {
    const variant = await ProductVariant.findOne({ where: { id: req.params.id, productId: req.params.productId } });
    if (!variant) return res.status(404).send("Product variant not found");
    await updateVariant(variant, req.body);
    await audit(req.user.email, "variant_updated", "product_variant", variant.id, req.body);
    return res.json(variant);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/products/:productId/variants/:id", async (req, res) => {
  const variant = await ProductVariant.findOne({ where: { id: req.params.id, productId: req.params.productId } });
  if (!variant) return res.status(404).send("Product variant not found");
  await variant.update({ active: false });
  await audit(req.user.email, "variant_archived", "product_variant", variant.id);
  return res.status(204).end();
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
router.get("/products-export.csv", async (_req, res) => res.type("text/csv").send(productsToCsv(await Product.findAll())));
router.post("/products-import.csv", express.text({ type: "text/csv", limit: "1mb" }), async (req, res) => {
  try { const records = parseProductCsv(req.body); for (const record of records) await createProduct(record); res.json({ imported: records.length }); }
  catch (error) { res.status(400).send(error.message); }
});
router.post("/bundles", async (req, res) => {
  const priceAmount = Number(req.body.priceAmount); if (!req.body.name || !Number.isInteger(priceAmount) || !Array.isArray(req.body.items)) return res.status(400).send("Bundle name, price, and items are required");
  const bundle = await ProductBundle.create({ ...req.body, priceAmount, active: true });
  await audit(req.user.email, "bundle_created", "product_bundle", bundle.id, { name: bundle.name });
  res.status(201).json(bundle);
});
router.get("/bundles", async (_req, res) => res.json(await ProductBundle.findAll({ order: [["createdAt", "DESC"]] })));
router.patch("/bundles/:id", async (req, res) => {
  const bundle = await ProductBundle.findByPk(req.params.id);
  if (!bundle) return res.status(404).send("Bundle not found");
  await bundle.update({ active: req.body.active !== false });
  await audit(req.user.email, "bundle_updated", "product_bundle", bundle.id, { active: bundle.active });
  return res.json(bundle);
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
router.get("/analytics", async (_req, res) => res.json(await operationsSummary()));
router.get("/reports/operations.csv", async (_req, res) => {
  res.type("text/csv").send(operationsSummaryToCsv(await operationsSummary()));
});
router.post("/low-stock-alerts", async (req, res) => {
  const recipient = req.body.recipient || req.user.email;
  res.json({ queued: await queueLowStockAlerts(recipient) });
});

router.get("/users", async (_req, res) => {
  res.json(await Userdetail.findAll({
    attributes: ["id", "firstname", "lastname", "email", "role", "emailVerifiedAt", "createdAt"],
    order: [["createdAt", "DESC"]],
  }));
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const roles = ["admin", "catalog", "customer", "fulfillment", "operations", "support"];
    if (!roles.includes(req.body.role)) throw new Error(`Role must be one of: ${roles.join(", ")}`);
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
router.get("/reviews", async (_req, res) => res.json(await ProductReview.findAll({ where: { status: "pending" }, order: [["createdAt", "ASC"]] })));
router.patch("/reviews/:id", async (req, res) => {
  if (!["approved", "rejected"].includes(req.body.status)) return res.status(400).send("Review status must be approved or rejected");
  const review = await ProductReview.findByPk(req.params.id);
  if (!review) return res.status(404).send("Review not found");
  await review.update({ status: req.body.status });
  res.json(review);
});

router.post("/notifications/deliver", async (_req, res) => {
  res.json({ delivered: await deliverPendingNotifications() });
});

router.get("/tickets", async (_req, res) => {
  res.json(await SupportTicket.findAll({ order: [["createdAt", "DESC"]] }));
});
router.patch("/tickets/:id", async (req, res) => {
  const ticket = await SupportTicket.findByPk(req.params.id);
  if (!ticket) return res.status(404).send("Ticket not found");
  await ticket.update({ status: req.body.status || ticket.status, adminReply: req.body.adminReply ?? ticket.adminReply });
  await audit(req.user.email, "support_ticket_updated", "support_ticket", ticket.id, { status: ticket.status });
  return res.json(ticket);
});
router.get("/gift-cards", async (_req, res) => {
  res.json(await GiftCard.findAll({ order: [["createdAt", "DESC"]] }));
});
router.post("/gift-cards", async (req, res) => {
  const balanceAmount = Number(req.body.balanceAmount);
  if (!Number.isInteger(balanceAmount) || balanceAmount < 1) return res.status(400).send("Positive gift card balance required");
  const giftCard = await GiftCard.create({
    code: crypto.randomBytes(8).toString("hex").toUpperCase(),
    balanceAmount,
    currency: String(req.body.currency || "gbp").toLowerCase(),
    expiresAt: req.body.expiresAt || null,
  });
  await audit(req.user.email, "gift_card_created", "gift_card", giftCard.id, { balanceAmount, currency: giftCard.currency });
  return res.status(201).json(giftCard);
});

module.exports = router;
