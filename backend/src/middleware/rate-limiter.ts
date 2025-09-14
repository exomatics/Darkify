import { rateLimit } from 'express-rate-limit';

import { STATIC_AUDIO_PATH } from '../config/config.ts';
import { ROUTES } from '../routes/routes.ts';

export const rateLimiters = {
  globalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (request, _response) => {
      const skipList = [ROUTES.USERS.POST_LOGIN, ROUTES.TRACKS.GET_STREAM_TRACK, STATIC_AUDIO_PATH];

      return skipList.some((element) => request.url.startsWith(element));
    },
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
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  filesLimiter: rateLimit({
    windowMs: 0.5 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
};
