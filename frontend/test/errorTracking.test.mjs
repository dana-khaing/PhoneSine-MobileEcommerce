import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("global error boundary reports browser failures without query parameters", () => {
  const source = fs.readFileSync(new URL("../src/app/global-error.js", import.meta.url), "utf8");
  assert.match(source, /\/client-errors/);
  assert.match(source, /window\.location\.pathname/);
  assert.doesNotMatch(source, /window\.location\.href/);
});
