const { AuditLog } = require("../models");

async function audit(actor, action, resourceType, resourceId, metadata = {}, transaction) {
  return AuditLog.create(
    { actor, action, resourceType, resourceId: String(resourceId), metadata },
    { transaction }
  );
}

module.exports = { audit };
