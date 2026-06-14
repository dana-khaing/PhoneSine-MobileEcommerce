const express = require("express");
const { subscribeToStock } = require("./stockAlertService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const alert = await subscribeToStock(req.body);
    return res.status(201).json({ id: alert.id, status: alert.status });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
