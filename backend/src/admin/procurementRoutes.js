const express = require("express");
const { PurchaseOrder, Supplier, Warehouse } = require("../../models");
const { audit } = require("../auditService");
const { createPurchaseOrder, receivePurchaseOrder } = require("../procurementService");

const router = express.Router();

router.get("/suppliers", async (_req, res) => res.json(await Supplier.findAll({ order: [["name", "ASC"]] })));
router.post("/suppliers", async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).send("Supplier name required");
  const supplier = await Supplier.create({ name, email: req.body.email || null, phone: req.body.phone || null });
  await audit(req.user.email, "supplier_created", "supplier", supplier.id, { name });
  return res.status(201).json(supplier);
});

router.get("/warehouses", async (_req, res) => res.json(await Warehouse.findAll({ include: [{ association: "stocks", include: ["product"] }], order: [["name", "ASC"]] })));
router.post("/warehouses", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const code = String(req.body.code || "").trim().toUpperCase();
  if (!name || !code || !req.body.address) return res.status(400).send("Warehouse name, code, and address required");
  const warehouse = await Warehouse.create({ name, code, address: req.body.address });
  await audit(req.user.email, "warehouse_created", "warehouse", warehouse.id, { code });
  return res.status(201).json(warehouse);
});

router.get("/purchase-orders", async (_req, res) => res.json(await PurchaseOrder.findAll({
  include: ["supplier", "warehouse", { association: "items", include: ["product"] }],
  order: [["createdAt", "DESC"]],
})));

router.post("/purchase-orders", async (req, res) => {
  try {
    const order = await createPurchaseOrder(req.body);
    await audit(req.user.email, "purchase_order_created", "purchase_order", order.id, { totalAmount: order.totalAmount });
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.post("/purchase-orders/:id/receive", async (req, res) => {
  try {
    const order = await receivePurchaseOrder(req.params.id);
    await audit(req.user.email, "purchase_order_received", "purchase_order", order.id);
    return res.json(order);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
