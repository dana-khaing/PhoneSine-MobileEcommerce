const crypto = require("crypto"); const express = require("express"); const { GiftCard, SupportTicket } = require("../models"); const { requireAuth, requirePermission } = require("./authMiddleware");
const router = express.Router();
router.get("/tickets", requireAuth, async (req, res) => res.json(await SupportTicket.findAll({ where: { userId: req.user.userId }, order: [["createdAt", "DESC"]] })));
router.post("/tickets", requireAuth, async (req, res) => {
  const subject = String(req.body.subject || "").trim(), message = String(req.body.message || "").trim(); if (!subject || !message) return res.status(400).send("Subject and message are required");
  res.status(201).json(await SupportTicket.create({ userId: req.user.userId, subject, message }));
});
router.get("/admin/tickets", requirePermission("support.manage"), async (_req, res) => res.json(await SupportTicket.findAll({ order: [["createdAt", "DESC"]] })));
router.patch("/admin/tickets/:id", requirePermission("support.manage"), async (req, res) => { const ticket = await SupportTicket.findByPk(req.params.id); if (!ticket) return res.status(404).send("Ticket not found"); await ticket.update({ status: req.body.status || ticket.status, adminReply: req.body.adminReply ?? ticket.adminReply }); res.json(ticket); });
router.post("/admin/gift-cards", requirePermission("promotions.manage"), async (req, res) => { const balanceAmount = Number(req.body.balanceAmount); if (!Number.isInteger(balanceAmount) || balanceAmount < 1) return res.status(400).send("Positive gift card balance required"); res.status(201).json(await GiftCard.create({ code: crypto.randomBytes(8).toString("hex").toUpperCase(), balanceAmount, currency: req.body.currency || "gbp" })); });
router.get("/gift-cards/:code", async (req, res) => { const card = await GiftCard.findOne({ where: { code: req.params.code.toUpperCase(), active: true } }); if (!card) return res.status(404).send("Gift card not found"); res.json({ balanceAmount: card.balanceAmount, currency: card.currency, expiresAt: card.expiresAt }); });
module.exports = router;
