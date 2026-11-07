const { rateLimit } = require('express-rate-limit');

const createRateLimiter = ({ windowMs, maxRequests }) =>
  rateLimit({
    windowMs,
    limit: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/health'),
    handler: (req, res) =>
      res.status(429).json({
        code: 429,
        message: 'Too many requests. Please try again later.',
        ...(req.id && { requestId: req.id }),
      }),
  });

module.exports = createRateLimiter;
