import { Router } from 'express';

import userController from '../controllers/user-controller.ts';
import { uuidScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';
const router = Router();

router.get(ROUTES.USERS.GET, async (request: Request, response: Response) => {
  try {
    const validation = uuidScheme.safeParse(request.params.userId);
    if (!validation.success) {
      response.status(400).json({ status: 'Error', message: validation.error.issues });
      return;
    }
    const databaseResponse = await userController.getUserInfo(request.params.userId.trim());
    if (
      databaseResponse instanceof Error &&
      databaseResponse.message === 'User with this id does not exist'
    ) {
      response.status(400).json({ status: 'Error', message: databaseResponse.message });
      return;
    }
    response.json(databaseResponse);
  } catch (error) {
    response.status(500).json({
      Error: 'internal error ',
      message: error instanceof Error ? error.message : '',
    });
  }
});
export default router;
