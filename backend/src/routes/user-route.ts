import { Router } from 'express';

import userController from '../controllers/user-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { uuidScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';

const router = Router();

router.get(
  ROUTES.USERS.GET,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.userId);
    if (!validation.success) {
      throw new ValidationError(validation.error.message);
    }
    const databaseResponse = await userController.getUserInfo(request.params.userId.trim());
    response.json(databaseResponse);
  }),
);
export default router;
