import test from "node:test";
import assert from "node:assert/strict";
import { translate } from "../src/app/i18n.mjs";

test("translates supported storefront messages and falls back to English", () => {
  assert.equal(translate("my", "home"), "ပင်မ");
  assert.equal(translate("unknown", "products"), "Products");
  assert.equal(translate("en", "missing"), "missing");
});
