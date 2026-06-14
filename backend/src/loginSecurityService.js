const { LoginEvent } = require("../models");

async function recordLoginEvent({ userId, email, method, successful, ipAddress, userAgent, reason }) {
  return LoginEvent.create({ userId, email, method, successful, ipAddress, userAgent, reason });
}

async function listLoginEvents(userId) {
  return LoginEvent.findAll({
    where: { userId },
    attributes: ["id", "method", "successful", "ipAddress", "userAgent", "reason", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: 50,
  });
}

module.exports = { listLoginEvents, recordLoginEvent };
