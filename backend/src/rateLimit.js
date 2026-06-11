function createRateLimiter({ windowMs, max }) {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    const current = clients.get(key);
    const record =
      !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current;
    record.count += 1;
    clients.set(key, record);
    if (record.count > max) return res.status(429).send("Too many requests");
    return next();
  };
}

module.exports = { createRateLimiter };
