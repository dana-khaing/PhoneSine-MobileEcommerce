export function addCartItem(items, product) {
  const existingItem = items.find((item) => item.id === product.id);

  if (existingItem) {
    return items.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  return [...items, { ...product, quantity: 1 }];
}

export function updateCartItemQuantity(items, productId, quantity) {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== productId);
  }

  return items.map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );
}

export function cartItemCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
