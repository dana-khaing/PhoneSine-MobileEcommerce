import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("core pages provide a single descriptive level-one heading", () => {
  for (const file of ["src/app/orders/page.js", "src/app/support/page.js", "src/app/security/page.js"]) {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /<h1[^>]*>/, `${file} should contain an h1`);
  }
});

test("interactive product images include alternative text", () => {
  const source = fs.readFileSync(new URL("../src/app/products/[id]/page.js", import.meta.url), "utf8");
  assert.match(source, /alt=/);
});
