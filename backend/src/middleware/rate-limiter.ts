import { rateLimit } from 'express-rate-limit';

import type { NextFunction, Request, Response } from 'express';

export function rateLimiter(request: Request, response: Response, next: NextFunction) {
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  next();
}
