const express = require("express");
const { Order, OrderItem } = require("../models");
const { requireAuth } = require("./authMiddleware");
const { Op } = require("sequelize");

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
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch {
    res.status(500).send("Unable to load orders");
  }
});

module.exports = router;
