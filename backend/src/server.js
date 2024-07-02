require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const authRoute = require("./auth");
const db = require("../models");

const { Userdetail } = require("../models");
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/auth", authRoute);

// test subject for sequelize database
app.get("/insert", async (req, res) => {
  try {
    const user = await Userdetail.create({
      firstname: "John",
      lastname: "Doe",
      email: "johndoe12@gmail.com",
      password: "password",
    });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while inserting data");
  }
});

app.get("/showall", async (req, res) => {
  try {
    const users = await Userdetail.findAll();
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
});

app.get("/deleteall", async (req, res) => {
  try {
    await Userdetail.destroy({
      where: {},
    });
    res.send("All records deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting data");
  }
});

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/productsList.json"));
});

const PORT = process.env.PORT;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
