import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import dashboard from '../controllers/dashboard-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { uuidScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response, RequestHandler } from 'express';
const router = Router();

router.get(
  ROUTES.DASHBOARD.GET_DASHBOARD,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.user_id);

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await dashboard.getDashboard(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
