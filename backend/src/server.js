require("dotenv").config();
const db = require("../models");
const { createApp } = require("./app");
const { runMaintenance } = require("./maintenanceService");

const PORT = process.env.PORT;
db.sequelize.authenticate().then(() => {
  createApp().listen(PORT, () => console.log(`Server started on port ${PORT}`));
  if (process.env.RUN_IN_PROCESS_JOBS === "true") {
    const maintenance = setInterval(() => runMaintenance().catch((error) => console.error("Commerce maintenance failed:", error.message)), 10 * 60 * 1000);
    maintenance.unref();
  }
});
