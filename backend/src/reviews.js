const express = require("express");
const { ProductReview } = require("../models");
const { requireAuth } = require("./authMiddleware");
const { hasPurchased, reviewFields } = require("./reviewService");
const router = express.Router();
router.get("/products/:productId", async (req, res) => {
  const reviews = await ProductReview.findAll({ where: { productId: req.params.productId, status: "approved" }, include: [{ association: "author", attributes: ["firstname"] }], order: [["createdAt", "DESC"]] });
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  res.json({ averageRating, reviewCount: reviews.length, reviews });
});
router.post("/products/:productId", requireAuth, async (req, res) => {
  try {
    const verifiedPurchase = await hasPurchased(req.user.userId, req.params.productId);
    const [review, created] = await ProductReview.upsert({ userId: req.user.userId, productId: req.params.productId, ...reviewFields(req.body), verifiedPurchase, status: "pending" }, { returning: true });
    res.status(created ? 201 : 200).json(review);
  } catch (error) { res.status(400).send(error.message); }
});
module.exports = router;
