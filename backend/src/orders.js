const express = require("express");
const { Order, OrderItem } = require("../models");
const { requireAuth } = require("./authMiddleware");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const orders = await Order.findAll({
    where: { email: req.user.email },
    include: [{ model: OrderItem, as: "items" }],
    order: [["createdAt", "DESC"]],
  });
  res.json(orders);
});

module.exports = router;
