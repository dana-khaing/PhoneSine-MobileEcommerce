const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoute = require("./auth");
const paymentRoute = require("./payments");
const orderRoute = require("./orders");
const adminRoute = require("./admin");
const paymentMethodsRoute = require("./paymentMethods");
const productImagesRoute = require("./productImages");
const savedItemsRoute = require("./savedItems");
const reviewsRoute = require("./reviews");
const shippingRoute = require("./shipping");
const customerExperienceRoute = require("./customerExperience");
const { stripeWebhook } = require("./stripeWebhook");
const { Category, Product, ProductBundle } = require("../models");
const { createRateLimiter } = require("./rateLimit");
const { presentProduct } = require("./productPresenter");
const { discoveryQuery } = require("./productDiscovery");
const { Op } = require("sequelize");
const { csrfProtection, securityHeaders } = require("./securityMiddleware");
const { errorHandler, requestLogger } = require("./logger");

function createApp() {
  const app = express();
  app.use(securityHeaders);
  app.use(requestLogger);
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000", credentials: true }));
  app.post("/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
  app.use("/admin/products", productImagesRoute);
  app.use(express.json({ limit: "100kb" }));
  app.use(csrfProtection);
  app.use(createRateLimiter({ windowMs: 60_000, max: 120 }));
  app.use(express.static(path.join(__dirname, "../public")));
  app.use("/auth", authRoute);
  app.use("/payments", paymentRoute);
  app.use("/orders", orderRoute);
  app.use("/payment-methods", paymentMethodsRoute);
  app.use("/saved", savedItemsRoute);
  app.use("/reviews", reviewsRoute);
  app.use("/shipping", shippingRoute);
  app.use("/customer", customerExperienceRoute);
  app.use("/admin", adminRoute);
  app.get("/health", async (_req, res) => {
    try {
      await Product.sequelize.authenticate();
      res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "unavailable", database: "disconnected" });
    }
  });

  app.get("/products", async (_req, res) => {
    const query = discoveryQuery(_req.query);
    const { rows: products, count } = await Product.findAndCountAll({
      where: query.where,
      limit: query.limit,
      offset: query.offset,
      order: query.order,
      distinct: true,
      include: [
        { association: "category" },
        { association: "images", separate: true, order: [["position", "ASC"]] },
        { association: "variants", where: { active: true }, required: false },
      ],
      attributes: [
        "id",
        "name",
        "brand",
        "description",
        ["priceAmount", "priceInPence"],
        "stockQuantity",
        "reservedQuantity",
        "categoryId",
        "specifications",
        "allowBackorder",
        "preorderDate",
      ],
    });
    res.set("X-Total-Count", String(count));
    res.set("X-Page", String(query.page));
    res.json(products.map(presentProduct));
  });

  app.get("/categories", async (_req, res) => {
    res.json(await Category.findAll({
      attributes: ["id", "name", "slug"],
      include: [{ association: "products", attributes: [], where: { active: true }, required: false }],
      group: ["Category.id"],
      order: [["name", "ASC"]],
    }));
  });

  app.get("/products/compare", async (req, res) => {
    const ids = String(req.query.ids || "").split(",").map(Number).filter(Boolean).slice(0, 4);
    if (ids.length < 2) return res.status(400).send("Select between 2 and 4 products");
    const products = await Product.findAll({ where: { id: { [Op.in]: ids }, active: true }, include: ["category", "variants", "images"] });
    res.json(products.map(presentProduct));
  });

  app.get("/products/:id", async (req, res) => {
    const product = await Product.findOne({
      where: { id: req.params.id, active: true },
      include: [
        { association: "category" },
        { association: "images", separate: true, order: [["position", "ASC"]] },
        { association: "variants", where: { active: true }, required: false },
      ],
    });
    if (!product) return res.status(404).send("Product not found");
    return res.json(presentProduct(product));
  });
  app.get("/products/:id/recommendations", async (req, res) => {
    const product = await Product.findByPk(req.params.id); if (!product) return res.status(404).send("Product not found");
    const where = { active: true, id: { [Op.ne]: product.id } }; if (product.categoryId) where.categoryId = product.categoryId;
    res.json((await Product.findAll({ where, limit: 4, include: ["images"] })).map(presentProduct));
  });
  app.get("/bundles", async (_req, res) => res.json(await ProductBundle.findAll({ where: { active: true } })));

  app.use((_req, res) => res.status(404).send("Not found"));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
