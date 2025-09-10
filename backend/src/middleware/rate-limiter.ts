import { rateLimit } from 'express-rate-limit';

export const rateLimiters = {
  globalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),

  authLimiter: rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
      error: 'Too many authentication attempts',
      retryAfter: '10 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  }),

  streamLimiter: rateLimit({
    windowMs: 0.5 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
};
