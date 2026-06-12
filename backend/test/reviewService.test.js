const test = require("node:test");
const assert = require("node:assert/strict");
const { reviewFields } = require("../src/reviewService");
test("validates review fields", () => {
  assert.deepEqual(reviewFields({ rating: 5, title: "Great", body: "Excellent phone" }), { rating: 5, title: "Great", body: "Excellent phone" });
  assert.throws(() => reviewFields({ rating: 6, title: "Bad", body: "Invalid" }), /between 1 and 5/);
});
