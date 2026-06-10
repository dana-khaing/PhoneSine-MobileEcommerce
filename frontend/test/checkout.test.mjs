import test from "node:test";
import assert from "node:assert/strict";
import { checkoutTotal, validateCheckoutDetails } from "../src/app/checkout/checkout.mjs";

const validDetails = {
  email: "buyer@example.com",
  firstName: "Dana",
  lastName: "Khaing",
  address: "1 High Street",
  city: "London",
  postcode: "SW1A 1AA",
};

test("adds the selected delivery price to checkout totals", () => {
  assert.equal(checkoutTotal(100, "standard"), 100);
  assert.equal(checkoutTotal(100, "express"), 112.5);
});

test("accepts complete checkout details", () => {
  assert.equal(validateCheckoutDetails(validDetails), null);
});

test("rejects incomplete and invalid checkout details", () => {
  assert.equal(
    validateCheckoutDetails({ ...validDetails, city: "" }),
    "Please complete all shipping details."
  );
  assert.equal(
    validateCheckoutDetails({ ...validDetails, email: "invalid" }),
    "Please enter a valid email address."
  );
});
