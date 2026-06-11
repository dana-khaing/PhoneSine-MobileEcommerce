const express = require("express");
const { Userdetail } = require("../models");
const { requireAuth } = require("./authMiddleware");
const { detachPaymentMethod, listPaymentMethods } = require("./stripeApi");
const { audit } = require("./auditService");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const user = await Userdetail.findByPk(req.user.userId);
    if (!user?.stripeCustomerId) return res.json([]);
    const methods = await listPaymentMethods(user.stripeCustomerId);
    return res.json(methods.data || []);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await Userdetail.findByPk(req.user.userId);
    if (!user?.stripeCustomerId) return res.status(404).send("Stripe customer not found");
    const methods = await listPaymentMethods(user.stripeCustomerId);
    if (!(methods.data || []).some((method) => method.id === req.params.id)) {
      return res.status(404).send("Payment method not found");
    }
    await detachPaymentMethod(req.params.id);
    await audit(req.user.email, "payment_method_detached", "payment_method", req.params.id);
    return res.status(204).end();
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
