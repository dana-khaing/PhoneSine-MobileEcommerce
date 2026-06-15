const express = require("express");
const { requireAuth } = require("./authMiddleware");
const { personalizedProducts, recentProducts, recordProductView } = require("./recommendationService");

const router = express.Router();
router.use(requireAuth);

router.post("/views/:productId", async (req, res) => {
  try {
    await recordProductView(req.user.userId, Number(req.params.productId));
    return res.status(204).end();
  } catch (error) {
    return res.status(404).send(error.message);
  }
});
router.get("/recent", async (req, res) => res.json(await recentProducts(req.user.userId)));
router.get("/personalized", async (req, res) => res.json(await personalizedProducts(req.user.userId)));

module.exports = router;
