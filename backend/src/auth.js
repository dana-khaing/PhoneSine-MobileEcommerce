const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const user = []; // user object

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).send("Please fill all the fields");
  }
  //   console.log(firstname, lastname, email, password);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.push({
    Firstname: firstname,
    Lastname: lastname,
    email,
    password: hashedPassword,
  });
  console.log(user);
  res.status(200).json({
    username: firstname + " " + lastname,
    email: email,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email, password);
  if (!email || !password) {
    return res.status(400).send("Please fill all the fields");
  }
  const currentUser = user.find((user) => user.email === email);
  if (!currentUser) return res.status(400).send("User not found");
  const validPassword = await bcrypt.compare(password, currentUser.password);
  if (!validPassword) return res.status(400).send("Invalid password");
  //   console.log(currentUser);
  res.status(200).json({
    username: currentUser.Firstname + " " + currentUser.Lastname,
    email: currentUser.email,
  });
});

module.exports = router;
