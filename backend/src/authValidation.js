function normalizeEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) {
    return email;
  }

  const [userAddress, domain] = email.split("@");
  return `${userAddress.toLowerCase()}@${domain}`;
}

function validateRegistrationInput({ firstname, lastname, email, password }) {
  if (!firstname || !lastname || !email || !password) {
    return "Please fill all the fields";
  }
  if (firstname.search(/[0-9]/) >= 0) {
    return "First name must not contain numbers";
  }
  if (firstname.search(/[!@#$%^&*]/) >= 0) {
    return "First name must not contain special characters";
  }
  if (firstname.search(/[\uD800-\uDFFF]/) >= 0) {
    return "First name must not contain emojis";
  }
  if (lastname.search(/[0-9]/) >= 0) {
    return "Last name must not contain numbers";
  }
  if (lastname.search(/[!@#$%^&*]/) >= 0) {
    return "Last name must not contain special characters";
  }
  if (lastname.search(/[\uD800-\uDFFF]/) >= 0) {
    return "Last name must not contain emojis";
  }
  if (email.search(/@/) < 0) {
    return "Email must contain @";
  }
  if (!email.includes(".com") && !email.includes(".in") && !email.includes(".org")) {
    return "Email must contain .com, .in or .org";
  }
  if (email.search(/\s/) >= 0) {
    return "Email must not contain whitespace";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (password.search(/[a-z]/i) < 0) {
    return "Password must contain a letter";
  }
  if (password.search(/[0-9]/) < 0) {
    return "Password must contain a number";
  }
  if (password.search(/[!@#$%^&*]/) < 0) {
    return "Password must contain a special character";
  }
  if (password.search(/\s/) >= 0) {
    return "Password must not contain whitespace";
  }
  if (password.search(/[A-Z]/) < 0) {
    return "Password must contain an uppercase letter";
  }
  if (password.search(/[a-z]/) < 0) {
    return "Password must contain a lowercase letter";
  }
  if (password.search(/[\uD800-\uDFFF]/) >= 0) {
    return "Password must not contain emojis";
  }

  return null;
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    return "Please fill all the fields .";
  }
  if (!email.includes("@")) {
    return "Invalid email";
  }

  return null;
}

module.exports = {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
};
