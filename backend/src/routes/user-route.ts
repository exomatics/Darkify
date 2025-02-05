import { Router } from 'express';

import userController from '../controllers/user-controller.ts';
import OperationalError from '../errors/operational-error.ts';
import asyncHandler from '../middleware/async-handler.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';

const router = Router();

router.get(
  ROUTES.USERS.GET,
  asyncHandler(async (request: Request, response: Response) => {
    const databaseResponse = await userController.getUserInfo(request.params.userId.trim());
    if (databaseResponse instanceof OperationalError) {
      throw databaseResponse;
    }
    response.json(databaseResponse);
  }),
);
export default router;
