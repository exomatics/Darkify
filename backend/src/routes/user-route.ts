import { Router } from 'express';

import userController from '../controllers/user-controller';

import { ROUTES } from './routes';
const router = Router();

router.get(ROUTES.USERS.GET, async (request, response) => {
  try {
    const databaseResponse = await userController.getUserInfo(request.params.userId);
    response.json(databaseResponse);
  } catch {
    response.json('internal error');
  }
});
export default router;
