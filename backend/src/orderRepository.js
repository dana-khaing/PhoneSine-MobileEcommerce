const { Order, OrderItem, sequelize } = require("../models");
const { calculateOrderTotal } = require("./orderService");

async function createOrderWithItems({ checkout, checkoutItems, userId = null }) {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.create(
      {
        userId,
        email: checkout.email,
        status: "pending",
        totalAmount: calculateOrderTotal(checkoutItems, checkout.deliveryMethod),
        deliveryMethod: checkout.deliveryMethod,
        shippingAddress: checkout,
      },
      { transaction }
    );

    await OrderItem.bulkCreate(
      checkoutItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        unitAmount: item.unitAmount,
        quantity: item.quantity,
      })),
      { transaction }
    );

    return order;
  });
}

module.exports = { createOrderWithItems };
