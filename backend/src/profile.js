const express = require("express");
const { CustomerAddress, Userdetail } = require("../models");
const { requireAuth } = require("./authMiddleware");
const { defaultNotificationPreferences, normalizeNotificationPreferences, saveAddress } = require("./profileService");
const { deleteAccount, exportAccountData } = require("./privacyService");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const user = await Userdetail.findByPk(req.user.userId, {
    attributes: ["id", "firstname", "lastname", "email", "emailVerifiedAt", "notificationPreferences"],
    include: [{ association: "addresses", order: [["isDefault", "DESC"], ["createdAt", "DESC"]] }],
  });
  const profile = user.toJSON();
  profile.notificationPreferences = { ...defaultNotificationPreferences, ...(profile.notificationPreferences || {}) };
  return res.json(profile);
});

router.patch("/", async (req, res) => {
  const firstname = String(req.body.firstname || "").trim();
  const lastname = String(req.body.lastname || "").trim();
  if (!firstname || !lastname || /[0-9]/.test(firstname + lastname)) return res.status(400).send("Valid first and last names are required");
  const user = await Userdetail.findByPk(req.user.userId);
  await user.update({ firstname, lastname });
  return res.json({ firstname: user.firstname, lastname: user.lastname, email: user.email });
});

router.patch("/notifications", async (req, res) => {
  const user = await Userdetail.findByPk(req.user.userId);
  const notificationPreferences = normalizeNotificationPreferences(req.body);
  await user.update({ notificationPreferences });
  return res.json({ notificationPreferences });
});

router.post("/addresses", async (req, res) => {
  try {
    return res.status(201).json(await saveAddress(req.user.userId, req.body));
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.patch("/addresses/:id", async (req, res) => {
  try {
    const address = await CustomerAddress.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!address) return res.status(404).send("Address not found");
    return res.json(await saveAddress(req.user.userId, req.body, address));
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/addresses/:id", async (req, res) => {
  const deleted = await CustomerAddress.destroy({ where: { id: req.params.id, userId: req.user.userId } });
  return deleted ? res.status(204).end() : res.status(404).send("Address not found");
});

router.get("/export", async (req, res) => {
  const data = await exportAccountData(req.user.userId);
  res.set("Content-Disposition", `attachment; filename="phone-sine-account-${req.user.userId}.json"`);
  return res.json(data);
});

router.delete("/", async (req, res) => {
  if (req.body.confirmation !== "DELETE") return res.status(400).send('Enter "DELETE" to confirm account deletion');
  await deleteAccount(req.user.userId);
  res.clearCookie("refreshToken");
  res.clearCookie("csrfToken");
  return res.status(204).end();
});

module.exports = router;
