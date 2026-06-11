const { Order, OrderEvent, OrderItem, Product, Promotion, sequelize } = require("../models");
const { calculateAmounts, validateAddress, validatePromotion } = require("./commerceService");
const { reserveInventory } = require("./inventoryService");
const { deliveryAmountFor } = require("./paymentService");

async function loadCheckoutItems(cartItems, transaction) {
  const items = [];
  for (const cartItem of cartItems) {
    const product = await Product.findByPk(cartItem.id, {
      transaction,
      lock: transaction.LOCK?.UPDATE,
    });
    const quantity = Number(cartItem.quantity);
    if (!product || !product.active) throw new Error(`Unknown product: ${cartItem.id}`);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`Invalid quantity for product: ${cartItem.id}`);
    }
    items.push({
      productId: product.id,
      name: product.name,
      unitAmount: product.priceAmount,
      quantity,
    });
  }
  return items;
}

async function createOrderWithItems({ checkout, cartItems, userId = null }) {
  return sequelize.transaction(async (transaction) => {
    const checkoutItems = await loadCheckoutItems(cartItems, transaction);
    const address = validateAddress(checkout);
    const promotion = checkout.promotionCode
      ? await Promotion.findOne({
          where: { code: checkout.promotionCode.toUpperCase() },
          transaction,
        })
      : null;
    const percentOff = promotion ? validatePromotion(promotion) : 0;
    const amounts = calculateAmounts(checkoutItems, {
      country: address.country,
      deliveryAmount: deliveryAmountFor(checkout.deliveryMethod),
      percentOff,
    });

    const order = await Order.create(
      {
        userId,
        email: checkout.email,
        status: "pending",
        ...amounts,
        promotionCode: promotion?.code,
        deliveryMethod: checkout.deliveryMethod,
        shippingAddress: address,
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

    await reserveInventory(
      order.id,
      checkoutItems,
      transaction,
      new Date(Date.now() + 30 * 60 * 1000)
    );
    await OrderEvent.create(
      {
        orderId: order.id,
        type: "order_created",
        message: "Order created and stock reserved",
      },
      { transaction }
    );

    return { order, checkoutItems };
  });
}

async function quoteOrder({ checkout, cartItems }) {
  return sequelize.transaction(async (transaction) => {
    const checkoutItems = await loadCheckoutItems(cartItems, transaction);
    const address = validateAddress(checkout);
    const promotion = checkout.promotionCode
      ? await Promotion.findOne({
          where: { code: checkout.promotionCode.toUpperCase() },
          transaction,
        })
      : null;
    const percentOff = promotion ? validatePromotion(promotion) : 0;
    return calculateAmounts(checkoutItems, {
      country: address.country,
      deliveryAmount: deliveryAmountFor(checkout.deliveryMethod),
      percentOff,
    });
  });
}

module.exports = { createOrderWithItems, loadCheckoutItems, quoteOrder };
