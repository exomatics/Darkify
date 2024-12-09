import { Router } from 'express';

import authController from '../controllers/auth-controller.ts';

import { ROUTES } from './routes.ts';

const router = Router();

router.post(ROUTES.USERS.POST_LOGIN, async function (request, responce) {
  const loginInfo = await authController.authenticateUser(request.body);
  if (loginInfo === undefined) {
    responce.status(404).json({ status: 'Error', message: 'user with this Id does not exist' });
  } else if (loginInfo === false) {
    responce.status(400).json({ status: 'Error', message: 'wrong password!' });
  } else if (loginInfo instanceof Error) {
    responce.status(500).json({ status: 'Error', message: 'internal Error' });
  }
  responce.status(200).json({
    status: 'success',
    ...loginInfo,
  });
});

router.post(ROUTES.USERS.POST_REGISTER, async function (request, responce) {
  const issuedJwt = await authController.registerUser(request.body);
  if (issuedJwt instanceof Error) {
    responce.status(500).json({ status: 'Error', message: 'internal Error' });
  }
  responce.status(200).json({
    ...issuedJwt,
  });
});
export default router;
