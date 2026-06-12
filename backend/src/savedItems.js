const express = require("express");
const { SavedCart, WishlistItem } = require("../models");
const { requireAuth } = require("./authMiddleware");
const { validateSavedItems } = require("./savedItemsService");

const router = express.Router();
router.use(requireAuth);

router.get("/wishlist", async (req, res) => {
  res.json(await WishlistItem.findAll({
    where: { userId: req.user.userId },
    include: [{ association: "product", include: ["images"] }, { association: "variant" }],
    order: [["createdAt", "DESC"]],
  }));
});

router.post("/wishlist", async (req, res) => {
  try {
    const [item] = await WishlistItem.findOrCreate({
      where: { userId: req.user.userId, productId: req.body.productId, variantId: req.body.variantId || null },
      defaults: { userId: req.user.userId, productId: req.body.productId, variantId: req.body.variantId || null },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/wishlist/:id", async (req, res) => {
  await WishlistItem.destroy({ where: { id: req.params.id, userId: req.user.userId } });
  res.status(204).end();
});

router.get("/cart", async (req, res) => {
  const cart = await SavedCart.findOne({ where: { userId: req.user.userId } });
  res.json(cart || { items: [] });
});

router.put("/cart", async (req, res) => {
  try {
    const items = await validateSavedItems(req.body.items);
    const [cart] = await SavedCart.upsert({ userId: req.user.userId, items }, { returning: true });
    res.json(cart);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
