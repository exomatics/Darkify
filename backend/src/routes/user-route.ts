import { Router } from 'express';

import userController from '../controllers/user-controller.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';
const router = Router();

router.get(ROUTES.USERS.GET, async (request: Request, response: Response) => {
  try {
    const databaseResponse = await userController.getUserInfo(request.params.userId.trim());
    response.json(databaseResponse);
  } catch (error) {
    response.json({
      Error: 'internal error 3',
      message: error instanceof Error ? error.message : '',
    });
  }
});
export default router;
