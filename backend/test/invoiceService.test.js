const test = require("node:test");
const assert = require("node:assert/strict");
const { createInvoicePdf } = require("../src/invoiceService");
test("creates a downloadable PDF invoice", () => {
  const pdf = createInvoicePdf({ id: 1, email: "buyer@example.com", status: "paid", currency: "gbp", totalAmount: 1000, items: [{ name: "Phone", quantity: 1, unitAmount: 1000 }] });
  assert.equal(pdf.subarray(0, 8).toString(), "%PDF-1.4");
  assert.match(pdf.toString(), /Phone Sine Invoice/);
});
