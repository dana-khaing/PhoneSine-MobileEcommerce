require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Userdetail } = require("../models");
const {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
} = require("./authValidation");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const validationError = validateRegistrationInput(req.body);

  if (validationError) {
    return res.status(400).send(validationError);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await Userdetail.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(400).send("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  await Userdetail.create({
    firstname: firstname,
    lastname: lastname,
    email: normalizedEmail,
    password: hashedPassword,
  });
  res.status(200).json({
    username: firstname + " " + lastname,
    email: email,
  });
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const validationError = validateLoginInput(req.body);

  if (validationError) {
    return res.status(400).send(validationError);
  }

  const emailfinal = normalizeEmail(email);
  const currentUser = await Userdetail.findOne({
    where: {
      email: emailfinal,
    },
  });
  if (!currentUser) return res.status(400).send("User not found");
  const validPassword = await bcrypt.compare(password, currentUser.password);
  if (!validPassword) return res.status(400).send("Invalid password");
  if (rememberMe === true) {
    const token = jwt.sign(
      {
        username: currentUser.firstname + " " + currentUser.lastname,
        email: currentUser.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ token });
    return;
  }
  const token = jwt.sign(
    {
      username: currentUser.firstname + " " + currentUser.lastname,
      email: currentUser.email,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({ token });
});

module.exports = router;
