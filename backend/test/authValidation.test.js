const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeEmail,
  validateLoginInput,
  validateRegistrationInput,
} = require("../src/authValidation");

const validRegistration = {
  firstname: "Dana",
  lastname: "Khaing",
  email: "Dana@example.com",
  password: "Password1!",
};

test("normalizes the email user address", () => {
  assert.equal(normalizeEmail("Dana.Khaing@example.com"), "dana.khaing@example.com");
});

test("does not throw while normalizing a malformed email", () => {
  assert.equal(normalizeEmail("invalid-email"), "invalid-email");
});

test("accepts valid registration input", () => {
  assert.equal(validateRegistrationInput(validRegistration), null);
});

test("rejects missing registration fields", () => {
  assert.equal(
    validateRegistrationInput({ ...validRegistration, firstname: "" }),
    "Please fill all the fields"
  );
});

test("rejects a weak registration password", () => {
  assert.equal(
    validateRegistrationInput({ ...validRegistration, password: "password" }),
    "Password must contain a number"
  );
});

test("rejects malformed login emails", () => {
  assert.equal(
    validateLoginInput({ email: "invalid-email", password: "Password1!" }),
    "Invalid email"
  );
});
