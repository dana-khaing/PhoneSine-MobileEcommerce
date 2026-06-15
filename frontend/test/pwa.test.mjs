import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("web app manifest defines installable application assets", () => {
  const manifest = JSON.parse(fs.readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ["192x192", "512x512"]);
});

test("service worker caches only the public shell and static assets", () => {
  const worker = fs.readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(worker, /"\/offline"/);
  assert.doesNotMatch(worker, /"\/checkout"|"\/orders"|"\/profile"|"\/admin"/);
});
