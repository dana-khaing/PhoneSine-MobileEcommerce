export const deliveryOptions = {
  standard: { label: "Standard delivery (3-5 days)", price: 0 },
  express: { label: "Express delivery (1-2 days)", price: 12.5 },
};

export function checkoutTotal(subtotal, deliveryMethod) {
  return subtotal + (deliveryOptions[deliveryMethod]?.price ?? 0);
}

export function validateCheckoutDetails(details) {
  const requiredFields = [
    "email",
    "firstName",
    "lastName",
    "address",
    "city",
    "postcode",
  ];

  if (requiredFields.some((field) => !details[field]?.trim())) {
    return "Please complete all shipping details.";
  }
  if (!details.email.includes("@")) {
    return "Please enter a valid email address.";
  }

  return null;
}
