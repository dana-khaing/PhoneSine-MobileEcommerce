const crypto = require("crypto");
const express = require("express");
const { AuditLog, GiftCard, Notification, Order, OrderEvent, OrderItem, ProductReview, Promotion, Refund, ReturnRequest, SupportTicket, Userdetail } = require("../models");
const { requireAdminRequestPermission, requireStaff } = require("./authMiddleware");
const {
  cancelOrRefundOrder,
  cleanupAbandonedOrders,
  updateFulfillment,
} = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { reconcilePayments } = require("./reconciliationService");
const { audit } = require("./auditService");
const catalogueRoutes = require("./admin/catalogueRoutes");
const { updateReturn } = require("./returnService");
const { operationsSummary, operationsSummaryToCsv, queueLowStockAlerts } = require("./operationsService");
const procurementRoutes = require("./admin/procurementRoutes");

const { launchStatus } = require("./launchStatusService");
const { metricsSnapshot } = require("./metricsService");

const router = express.Router();
router.use(requireStaff);
router.use(requireAdminRequestPermission);
router.use(catalogueRoutes);
router.use(procurementRoutes);

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
router.get("/observability", async (_req, res) => res.json(metricsSnapshot()));
router.get("/launch-status", async (_req, res) => res.json(launchStatus()));
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
