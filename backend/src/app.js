const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoute = require("./auth");
const paymentRoute = require("./payments");
const orderRoute = require("./orders");
const adminRoute = require("./admin");
const paymentMethodsRoute = require("./paymentMethods");
const { stripeWebhook } = require("./stripeWebhook");
const { Product } = require("../models");
const { createRateLimiter } = require("./rateLimit");

function createApp() {
  const app = express();
  app.use(cors());
  app.post("/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
  app.use(express.json({ limit: "100kb" }));
  app.use(createRateLimiter({ windowMs: 60_000, max: 120 }));
  app.use(express.static(path.join(__dirname, "../public")));
  app.use("/auth", authRoute);
  app.use("/payments", paymentRoute);
  app.use("/orders", orderRoute);
  app.use("/payment-methods", paymentMethodsRoute);
  app.use("/admin", adminRoute);

  app.get("/products", async (_req, res) => {
    const products = await Product.findAll({
      where: { active: true },
      attributes: [
        "id",
        "name",
        "brand",
        "description",
        ["priceAmount", "priceInPence"],
        "stockQuantity",
        "reservedQuantity",
      ],
    });
    res.json(
      products.map((product) => {
        const record = product.toJSON();
        return {
          ...record,
          price: record.priceInPence / 100,
          availableStock: record.stockQuantity - record.reservedQuantity,
        };
      })
    );
  });

  app.use((_req, res) => res.status(404).send("Not found"));
  return app;
}

module.exports = { createApp };
