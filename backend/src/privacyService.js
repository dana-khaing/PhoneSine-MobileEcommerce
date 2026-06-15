const crypto = require("crypto");
const {
  CustomerAddress,
  EmailVerificationToken,
  LoginEvent,
  LoyaltyAccount,
  LoyaltyTransaction,
  OAuthIdentity,
  Order,
  PasswordResetToken,
  ProductReview,
  ProductView,
  RefreshSession,
  ReturnRequest,
  SavedCart,
  SupportTicket,
  Userdetail,
  WishlistItem,
  sequelize,
} = require("../models");

async function exportAccountData(userId) {
  const user = await Userdetail.findByPk(userId, {
    attributes: ["id", "firstname", "lastname", "email", "emailVerifiedAt", "createdAt", "updatedAt"],
  });
  if (!user) throw new Error("Account not found");

  const [addresses, orders, wishlist, savedCart, oauthIdentities, loginEvents, reviews, returns, supportTickets, loyaltyAccount, loyaltyTransactions, productViews] = await Promise.all([
    CustomerAddress.findAll({ where: { userId }, order: [["createdAt", "ASC"]] }),
    Order.findAll({
      where: { userId },
      include: ["items", "events", "refunds", "returnRequest", "shipment"],
      order: [["createdAt", "ASC"]],
    }),
    WishlistItem.findAll({ where: { userId }, include: ["product", "variant"], order: [["createdAt", "ASC"]] }),
    SavedCart.findOne({ where: { userId } }),
    OAuthIdentity.findAll({ where: { userId }, attributes: ["provider", "email", "createdAt"] }),
    LoginEvent.findAll({
      where: { userId },
      attributes: ["method", "successful", "ipAddress", "userAgent", "reason", "createdAt"],
      order: [["createdAt", "ASC"]],
    }),
    ProductReview.findAll({ where: { userId }, order: [["createdAt", "ASC"]] }),
    ReturnRequest.findAll({ where: { userId }, order: [["createdAt", "ASC"]] }),
    SupportTicket.findAll({ where: { userId }, order: [["createdAt", "ASC"]] }),
    LoyaltyAccount.findOne({ where: { userId } }),
    LoyaltyTransaction.findAll({ where: { userId }, order: [["createdAt", "ASC"]] }),
    ProductView.findAll({ where: { userId }, order: [["lastViewedAt", "ASC"]] }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: user,
    addresses,
    orders,
    wishlist,
    savedCart,
    linkedAccounts: oauthIdentities,
    loginHistory: loginEvents,
    reviews,
    returns,
    supportTickets,
    rewards: { account: loyaltyAccount, transactions: loyaltyTransactions },
    productViews,
  };
}

async function deleteAccount(userId) {
  return sequelize.transaction(async (transaction) => {
    const user = await Userdetail.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!user) throw new Error("Account not found");

    const anonymousEmail = `deleted-${user.id}-${crypto.randomBytes(6).toString("hex")}@deleted.invalid`;
    await Promise.all([
      CustomerAddress.destroy({ where: { userId }, transaction }),
      EmailVerificationToken.destroy({ where: { userId }, transaction }),
      OAuthIdentity.destroy({ where: { userId }, transaction }),
      PasswordResetToken.destroy({ where: { userId }, transaction }),
      RefreshSession.destroy({ where: { userId }, transaction }),
      SavedCart.destroy({ where: { userId }, transaction }),
      WishlistItem.destroy({ where: { userId }, transaction }),
      LoginEvent.update(
        { userId: null, email: anonymousEmail, ipAddress: null, userAgent: null },
        { where: { userId }, transaction }
      ),
      Order.update(
        { userId: null, email: anonymousEmail, shippingAddress: { deleted: true }, stripeCustomerId: null },
        { where: { userId }, transaction }
      ),
    ]);
    await user.destroy({ transaction });
    return { deleted: true };
  });
}

module.exports = { deleteAccount, exportAccountData };
