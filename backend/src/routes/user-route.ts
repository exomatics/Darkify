import { Router } from 'express';

import userController from '../controllers/user-controller.ts';

import { ROUTES } from './routes.ts';
const router = Router();

router.get(ROUTES.USERS.GET, async (request, response) => {
  // try {
  const databaseResponse = await userController.getUserInfo(request.params.userId);
  response.json(databaseResponse);
  // } catch {
  //   response.json({"Error": "internal error"});
  // }
});
export default router;
