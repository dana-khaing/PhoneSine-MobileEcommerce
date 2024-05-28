const express = require("express");
const bcypt = require("bcrypt");
const router = express.Router();

const user = []; // user object

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("Please fill all the fields");
  }
  const salt = await bcypt.genSalt(10);
  const hashedPassword = await bcypt.hash(password, salt);
  user.push({
    name: `${firstName} ${lastName}`,
    email,
    password: hashedPassword,
  });
  res.status(201).send();
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please fill all the fields");
  }
  const currentUser = user.find((user) => user.email === email);
  if (!currentUser) return res.status(400).send("User not found");
  const validPassword = await bcypt.compare(password, currentUser.password);
  if (!validPassword) return res.status(400).send("Invalid password");
  res.status(200).send();
});

module.exports = router;
