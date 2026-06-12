const express = require("express");
const { Order, OrderEvent, OrderItem, Refund } = require("../models");
const { requireAuth } = require("./authMiddleware");
const { Op } = require("sequelize");
const { cancelOrRefundOrder } = require("./orderOperations");
const { createReturn } = require("./returnService");
const { createInvoicePdf } = require("./invoiceService");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const ownerConditions = [{ email: req.user.email }];
    if (req.user.userId) {
      ownerConditions.unshift({ userId: req.user.userId });
    }

    const orders = await Order.findAll({
      where: {
        [Op.or]: ownerConditions,
      },
      include: [
        { model: OrderItem, as: "items" },
        { model: Refund, as: "refunds" },
        { association: "returnRequest" },
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
  } catch {
    res.status(500).send("Unable to load orders");
  }
});
router.post("/:id/returns", requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, [Op.or]: [{ userId: req.user.userId }, { email: req.user.email }] } });
    if (!order) return res.status(404).send("Order not found");
    res.status(201).json(await createReturn(order, req.user.userId, req.body));
  } catch (error) { res.status(400).send(error.message); }
});
router.get("/:id/invoice", requireAuth, async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, [Op.or]: [{ userId: req.user.userId }, { email: req.user.email }] }, include: [{ model: OrderItem, as: "items" }] });
  if (!order) return res.status(404).send("Order not found");
  res.set("Content-Type", "application/pdf");
  res.set("Content-Disposition", `attachment; filename="order-${order.id}.pdf"`);
  res.send(createInvoicePdf(order));
});

router.post("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ userId: req.user.userId || null }, { email: req.user.email }],
      },
    });
    if (!order) return res.status(404).send("Order not found");
    await cancelOrRefundOrder(order, "customer");
    return res.json(order);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
