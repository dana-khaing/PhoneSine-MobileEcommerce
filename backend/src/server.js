require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const authRoute = require("./auth");
const db = require("../models");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/auth", authRoute);

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/productsList.json"));
});

const PORT = process.env.PORT;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
