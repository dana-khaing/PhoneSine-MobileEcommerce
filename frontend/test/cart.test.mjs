import test from "node:test";
import assert from "node:assert/strict";
import {
  addCartItem,
  cartItemKey,
  cartItemCount,
  cartSubtotal,
  updateCartItemQuantity,
} from "../src/app/cart/cart.mjs";

const phone = { id: 1, name: "Phone", price: 999 };

test("adds new products and increments existing products", () => {
  const first = addCartItem([], phone);
  const second = addCartItem(first, phone);

  assert.equal(second.length, 1);
  assert.equal(second[0].quantity, 2);
});

test("updates quantities and removes zero-quantity products", () => {
  const items = [{ ...phone, quantity: 2 }];
  assert.equal(updateCartItemQuantity(items, 1, 3)[0].quantity, 3);
  assert.deepEqual(updateCartItemQuantity(items, 1, 0), []);
});

test("calculates item count and subtotal", () => {
  const items = [{ ...phone, quantity: 2 }, { id: 2, price: 100, quantity: 1 }];
  assert.equal(cartItemCount(items), 3);
  assert.equal(cartSubtotal(items), 2098);
});

test("keeps product variants as separate cart lines", () => {
  const blue = { ...phone, variantId: 3, variantName: "Blue" };
  const black = { ...phone, variantId: 4, variantName: "Black" };
  const items = addCartItem(addCartItem([], blue), black);
  assert.equal(items.length, 2);
  assert.equal(cartItemKey(items[0]), "1:3");
  assert.equal(updateCartItemQuantity(items, "1:3", 3)[0].quantity, 3);
});
