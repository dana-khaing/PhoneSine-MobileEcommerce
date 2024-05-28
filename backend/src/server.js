const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const authRoute = require("./auth");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/auth", authRoute);

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/productsList.json"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Sever started on port ${PORT}`));
