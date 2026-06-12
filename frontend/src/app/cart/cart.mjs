export function cartItemKey(item) {
  return item.variantId ? `${item.id}:${item.variantId}` : String(item.id);
}

export function addCartItem(items, product) {
  const key = cartItemKey(product);
  const existingItem = items.find((item) => cartItemKey(item) === key);

  if (existingItem) {
    return items.map((item) =>
      cartItemKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  return [...items, { ...product, quantity: 1 }];
}

export function updateCartItemQuantity(items, key, quantity) {
  if (quantity <= 0) {
    return items.filter((item) => cartItemKey(item) !== String(key));
  }

  return items.map((item) =>
    cartItemKey(item) === String(key) ? { ...item, quantity } : item
  );
}

export function cartItemCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
