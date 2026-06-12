function escapePdf(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
function createInvoicePdf(order) {
  const lines = [
    "Phone Sine Invoice",
    `Order #${order.id}`,
    `Customer: ${order.email}`,
    `Status: ${order.status}`,
    ...order.items.map((item) => `${item.name} x ${item.quantity} - ${order.currency.toUpperCase()} ${((item.unitAmount * item.quantity) / 100).toFixed(2)}`),
    `Total: ${order.currency.toUpperCase()} ${(order.totalAmount / 100).toFixed(2)}`,
  ];
  const stream = lines.map((line, index) => `BT /F1 12 Tf 50 ${780 - index * 22} Td (${escapePdf(line)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) { offsets.push(Buffer.byteLength(pdf)); pdf += `${object}\n`; }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}
module.exports = { createInvoicePdf };
