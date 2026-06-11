const { Order, OrderEvent, OrderItem, Product, Promotion, PromotionUsage, sequelize } = require("../models");
const { calculateAmounts, validateAddress, validatePromotion } = require("./commerceService");
const { reserveInventory } = require("./inventoryService");
const { deliveryAmountFor } = require("./paymentService");
const { convertAmounts, normalizeCurrency } = require("./currencyService");

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

async function createOrderWithItems({ checkout, cartItems, userId = null, idempotencyKey }) {
  return sequelize.transaction(async (transaction) => {
    const checkoutItems = await loadCheckoutItems(cartItems, transaction);
    const address = validateAddress(checkout);
    const promotion = checkout.promotionCode
      ? await Promotion.findOne({
          where: { code: checkout.promotionCode.toUpperCase() },
          transaction,
          lock: transaction.LOCK?.UPDATE,
        })
      : null;
    const percentOff = promotion ? validatePromotion(promotion) : 0;
    if (promotion?.perCustomerLimit) {
      const uses = await PromotionUsage.count({
        where: { promotionId: promotion.id, email: checkout.email.toLowerCase() },
        transaction,
      });
      if (uses >= promotion.perCustomerLimit) throw new Error("Promotion customer limit reached");
    }
    const amounts = convertAmounts(calculateAmounts(checkoutItems, {
      country: address.country,
      deliveryAmount: deliveryAmountFor(checkout.deliveryMethod),
      percentOff,
    }), normalizeCurrency(checkout.currency));

    const order = await Order.create(
      {
        userId,
        email: checkout.email,
        status: "pending",
        ...amounts,
        promotionCode: promotion?.code,
        deliveryMethod: checkout.deliveryMethod,
        shippingAddress: address,
        currency: amounts.currency,
        idempotencyKey,
      },
      { transaction }
    );
    if (promotion) {
      await PromotionUsage.create(
        { promotionId: promotion.id, orderId: order.id, email: checkout.email.toLowerCase() },
        { transaction }
      );
      await promotion.increment("useCount", { by: 1, transaction });
    }
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
    return convertAmounts(calculateAmounts(checkoutItems, {
      country: address.country,
      deliveryAmount: deliveryAmountFor(checkout.deliveryMethod),
      percentOff,
    }), normalizeCurrency(checkout.currency));
  });
}

module.exports = { createOrderWithItems, loadCheckoutItems, quoteOrder };
