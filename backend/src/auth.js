const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "0a3c64f7d8b9e2f4a7b6c8d5e3f1a2b0e4c8d3b6a5f9e2d3b7c6e1a5f3d7b4e2";

const user = []; // user object

// function to lowercase the email address in front of @
function normalizeEmail(email) {
  const [useraddress, domain] = email.split("@");
  const lowerCaseUseraddress = useraddress.toLowerCase();
  const normalizedEmail = `${lowerCaseUseraddress}@${domain}`;

  return normalizedEmail;
}

router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).send("Please fill all the fields");
  }
  // first name must not contain numbers
  if (firstname.search(/[0-9]/) >= 0) {
    return res.status(400).send("First name must not contain numbers");
  }
  // first name must not contain special characters
  if (firstname.search(/[!@#$%^&*]/) >= 0) {
    return res
      .status(400)
      .send("First name must not contain special characters");
  }
  // first name must not contain emojis
  if (firstname.search(/[\uD800-\uDFFF]/) >= 0) {
    return res.status(400).send("First name must not contain emojis");
  }
  // last name must not contain numbers
  if (lastname.search(/[0-9]/) >= 0) {
    return res.status(400).send("Last name must not contain numbers");
  }
  // last name must not contain special characters

  if (lastname.search(/[!@#$%^&*]/) >= 0) {
    return res
      .status(400)
      .send("Last name must not contain special characters");
  }
  // first and last name must not contain emojis
  if (lastname.search(/[\uD800-\uDFFF]/) >= 0) {
    return res.status(400).send("Last name must not contain emojis");
  }

  // Email restrictions
  if (user.find((user) => user.email === email)) {
    return res.status(401).send("User already exists");
  }

  if (email.search(/@/) < 0) {
    return res.status(400).send("Email must contain @");
  }
  if (
    email.search(/.com/) < 0 &&
    email.search(/.in/) < 0 &&
    email.search(/.org/) < 0
  ) {
    return res.status(400).send("Email must contain .com, .in or .org");
  }
  if (email.search(/\s/) >= 0) {
    return res.status(400).send("Email must not contain whitespace");
  }
  // Password restrictions
  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters");
  }
  if (password.search(/[a-z]/i) < 0) {
    return res.status(400).send("Password must contain a letter");
  }
  if (password.search(/[0-9]/) < 0) {
    return res.status(400).send("Password must contain a number");
  }
  if (password.search(/[!@#$%^&*]/) < 0) {
    return res.status(400).send("Password must contain a special character");
  }
  if (password.search(/\s/) >= 0) {
    return res.status(400).send("Password must not contain whitespace");
  }
  if (password.search(/[A-Z]/) < 0) {
    return res.status(400).send("Password must contain an uppercase letter");
  }
  if (password.search(/[a-z]/) < 0) {
    return res.status(400).send("Password must contain a lowercase letter");
  }
  //must not contain emojis
  if (password.search(/[\uD800-\uDFFF]/) >= 0) {
    return res.status(400).send("Password must not contain emojis");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.push({
    Firstname: firstname,
    Lastname: lastname,
    email: normalizeEmail(email),
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
    return res.status(400).send("Please fill all the fields .");
  }
  const emailfinal = normalizeEmail(email);
  const currentUser = user.find((user) => user.email === emailfinal);
  if (!currentUser) return res.status(400).send("User not found");
  const validPassword = await bcrypt.compare(password, currentUser.password);
  if (!validPassword) return res.status(400).send("Invalid password");
  //   console.log(currentUser);
  const token = jwt.sign(
    {
      username: currentUser.Firstname + " " + currentUser.Lastname,
      email: currentUser.email,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({ token });
});

module.exports = router;
