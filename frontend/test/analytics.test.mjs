import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("analytics config requires an explicit HTTPS script URL", async () => {
  const { analyticsConfig } = await import("../src/app/components/analytics.mjs");
  assert.equal(analyticsConfig({}), null);
  assert.equal(analyticsConfig({
    NEXT_PUBLIC_ANALYTICS_DOMAIN: "phonesine.com",
    NEXT_PUBLIC_ANALYTICS_SCRIPT_URL: "http://analytics.example/script.js",
  }), null);
  assert.deepEqual(analyticsConfig({
    NEXT_PUBLIC_ANALYTICS_DOMAIN: "phonesine.com",
    NEXT_PUBLIC_ANALYTICS_SCRIPT_URL: "https://analytics.example/script.js",
  }), {
    domain: "phonesine.com",
    src: "https://analytics.example/script.js",
  });
});

test("analytics excludes sensitive account and checkout routes", () => {
  const source = fs.readFileSync(new URL("../src/app/components/analytics.js", import.meta.url), "utf8");
  for (const route of ["/checkout", "/admin", "/orders", "/payment-methods", "/profile", "/security"]) {
    assert.match(source, new RegExp(route.replace("/", "\\/")));
  }
});
