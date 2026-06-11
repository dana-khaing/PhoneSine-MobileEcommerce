require("dotenv").config();
const db = require("../models");
const { createApp } = require("./app");
const { cleanupAbandonedOrders } = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { reconcilePayments } = require("./reconciliationService");

const PORT = process.env.PORT;
db.sequelize.authenticate().then(() => {
  createApp().listen(PORT, () => console.log(`Server started on port ${PORT}`));
  const maintenance = setInterval(async () => {
    try {
      await cleanupAbandonedOrders();
      await deliverPendingNotifications();
      await reconcilePayments();
    } catch (error) {
      console.error("Commerce maintenance failed:", error.message);
    }
  }, 10 * 60 * 1000);
  maintenance.unref();
});
