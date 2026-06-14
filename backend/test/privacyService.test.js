const test = require("node:test");
const assert = require("node:assert/strict");
const { deleteAccount, exportAccountData } = require("../src/privacyService");

test("privacy service exposes account export and deletion operations", () => {
  assert.equal(typeof exportAccountData, "function");
  assert.equal(typeof deleteAccount, "function");
});
