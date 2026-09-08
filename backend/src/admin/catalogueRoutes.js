const express = require("express");
const { Category, Product, ProductBundle, ProductVariant } = require("../../models");
const { audit } = require("../auditService");
const { parseProductCsv, productsToCsv } = require("../catalogueService");
const { createCategory, createProduct, createVariant, updateProduct, updateVariant } = require("../productService");

const router = express.Router();

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
  try {
    const records = parseProductCsv(req.body);
    for (const record of records) await createProduct(record);
    res.json({ imported: records.length });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/bundles", async (req, res) => {
  const priceAmount = Number(req.body.priceAmount);
  if (!req.body.name || !Number.isInteger(priceAmount) || !Array.isArray(req.body.items)) return res.status(400).send("Bundle name, price, and items are required");
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

module.exports = router;
