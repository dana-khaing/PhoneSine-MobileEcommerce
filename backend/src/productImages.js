const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { Product, ProductImage } = require("../models");
const { requireAdmin } = require("./authMiddleware");
const { audit } = require("./auditService");

const router = express.Router();
const uploadDir = path.join(__dirname, "../public/uploads/products");
const types = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

router.post("/:id/images", requireAdmin, express.raw({ type: Object.keys(types), limit: "2mb" }), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    const extension = types[req.headers["content-type"]];
    if (!extension || !Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).send("JPEG, PNG, or WebP image is required");
    }
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `${product.id}-${crypto.randomUUID()}.${extension}`;
    await fs.writeFile(path.join(uploadDir, filename), req.body);
    const position = await ProductImage.count({ where: { productId: product.id } });
    const image = await ProductImage.create({
      productId: product.id,
      url: `/uploads/products/${filename}`,
      altText: String(req.headers["x-alt-text"] || product.name).slice(0, 255),
      position,
    });
    await audit(req.user.email, "product_image_uploaded", "product", product.id, { imageId: image.id });
    return res.status(201).json(image);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/:id/images/:imageId", requireAdmin, async (req, res) => {
  const image = await ProductImage.findOne({ where: { id: req.params.imageId, productId: req.params.id } });
  if (!image) return res.status(404).send("Product image not found");
  const filename = path.basename(image.url);
  await image.destroy();
  await fs.unlink(path.join(uploadDir, filename)).catch(() => {});
  await audit(req.user.email, "product_image_deleted", "product", req.params.id, { imageId: req.params.imageId });
  return res.status(204).end();
});

module.exports = router;
