const { OrderEvent, ReturnRequest } = require("../models");
const transitions = {
  requested: ["approved", "rejected"],
  approved: ["in_transit"],
  in_transit: ["received"],
  received: ["refunded"],
};
function returnFields(input) {
  const reason = String(input.reason || "").trim();
  const details = String(input.details || "").trim();
  if (!reason) throw new Error("Return reason is required");
  if (reason.length > 120 || details.length > 2000) throw new Error("Return request is too long");
  return { reason, details };
}
async function updateReturn(request, input) {
  if (!transitions[request.status]?.includes(input.status)) throw new Error(`Cannot move return from ${request.status} to ${input.status}`);
  await request.update({ status: input.status, returnTrackingNumber: input.returnTrackingNumber ?? request.returnTrackingNumber, adminNote: input.adminNote ?? request.adminNote });
  await OrderEvent.create({ orderId: request.orderId, type: `return_${input.status}`, message: `Return ${input.status}` });
  return request;
}
async function createReturn(order, userId, input) {
  if (order.status !== "delivered") throw new Error("Only delivered orders can be returned");
  const request = await ReturnRequest.create({ orderId: order.id, userId, ...returnFields(input) });
  await OrderEvent.create({ orderId: order.id, type: "return_requested", message: "Customer requested a return" });
  return request;
}
module.exports = { createReturn, returnFields, updateReturn };
