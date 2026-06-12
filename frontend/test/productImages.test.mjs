import test from "node:test";
import assert from "node:assert/strict";
import { productImageUrl } from "../src/app/products/productImages.mjs";

test("builds product image URLs and falls back to the placeholder", () => {
  assert.equal(productImageUrl({ url: "/uploads/products/phone.webp" }, "https://api.example.com"), "https://api.example.com/uploads/products/phone.webp");
  assert.equal(productImageUrl(null, "https://api.example.com"), "/iph15-pro.jpeg");
});
