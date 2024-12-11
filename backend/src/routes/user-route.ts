import { Router } from 'express';

import userController from '../controllers/user-controller.ts';
import uuidSchema from '../validator.ts';

import { ROUTES } from './routes.ts';
const router = Router();

router.get(ROUTES.USERS.GET, async (request, response) => {
  try {
    const validation = uuidSchema.safeParse(request.params.userId);
    if (!validation.success) {
      response.status(400).json({ status: 'Error', message: validation.error?.issues });
      return;
    }
    const databaseResponse = await userController.getUserInfo(request.params.userId);
    if (
      databaseResponse instanceof Error &&
      databaseResponse.message === 'User with this id does not exist'
    ) {
      response.status(400).json({ status: 'Error', message: databaseResponse.message });
      return;
    }
    response.json(databaseResponse);
  } catch {
    response.status(500).json({ status: 'Error', message: 'internal Error' });
  }
});
export default router;
