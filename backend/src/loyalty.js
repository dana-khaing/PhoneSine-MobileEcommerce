const express = require("express");
const { requireAuth } = require("./authMiddleware");
const { applyReferralCode, loyaltySummary } = require("./loyaltyService");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => res.json(await loyaltySummary(req.user.userId)));
router.post("/referral", async (req, res) => {
  try {
    await applyReferralCode(req.user.userId, req.body.code);
    return res.json(await loyaltySummary(req.user.userId));
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
