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

test("admin page exposes launch status without secret values", () => {
  const source = fs.readFileSync(new URL("../src/app/admin/page.js", import.meta.url), "utf8");
  assert.match(source, /\/launch-status/);
  assert.match(source, /Launch status/);
  assert.doesNotMatch(source, /JWT_SECRET|STRIPE_SECRET_KEY|DATABASE_URL/);
});

test("storefront exposes branded navigation assets", () => {
  const navSource = fs.readFileSync(new URL("../src/app/components/nav-bar.js", import.meta.url), "utf8");
  const brandMark = fs.readFileSync(new URL("../public/brand-mark.svg", import.meta.url), "utf8");
  assert.match(navSource, /brand-mark\.svg/);
  assert.match(navSource, /PhoneSine/);
  assert.match(brandMark, /PhoneSine brand mark/);
});

test("status page exposes production health probes", () => {
  const statusSource = fs.readFileSync(new URL("../src/app/status/page.js", import.meta.url), "utf8");
  const navSource = fs.readFileSync(new URL("../src/app/components/nav-bar.js", import.meta.url), "utf8");
  assert.match(statusSource, /NEXT_PUBLIC_BACKEND_ORIGIN/);
  assert.match(statusSource, /\/health/);
  assert.match(statusSource, /\/health\/ready/);
  assert.match(navSource, /\/status/);
});
