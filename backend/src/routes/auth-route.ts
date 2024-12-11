import { Router } from 'express';
import passport from 'passport';

import authController from '../controllers/auth-controller.ts';

import { ROUTES } from './routes.ts';

const router = Router();
router.post(
  ROUTES.USERS.POST_ISSUE_ACCESS_TOKEN,
  passport.authenticate('refresh-token', { session: false }),
  async function (request, responce) {
    try {
      const newAccessToken = await authController.sendNewAccessTokenToUser(request.body);

      if (newAccessToken === undefined) {
        responce.status(404).json({ status: 'Error', message: 'user with this Id does not exist' });
        return;
      }
      return responce.status(200).json({
        status: 'Success',
        message: 'new access token has been successfully issued',
        accessToken: newAccessToken,
      });
    } catch {
      //until validatiom it means validation error too. In other words 400
      responce.status(500).json({ status: 'Error', message: 'internal error' });
      return;
    }
  },
);
router.post(ROUTES.USERS.POST_LOGIN, async function (request, responce) {
  try {
    const loginInfo = await authController.authenticateUser(request.body);
    if (loginInfo === undefined) {
      responce
        .status(404)
        .json({ status: 'Error', message: 'user with this username or email does not exist' });
      return;
    } else if (loginInfo === false) {
      responce.status(400).json({ status: 'Error', message: 'wrong password!' });
      return;
    }
    responce.status(200).json({
      status: 'Success',
      ...loginInfo,
    });
  } catch {
    //until validatiom it means validation error too. In other words 400
    responce.status(500).json({ status: 'Error', message: 'internal error' });
    return;
  }
});

router.post(ROUTES.USERS.POST_REGISTER, async function (request, responce) {
  try {
    const issuedJwt = await authController.registerUser(request.body);
    if (issuedJwt instanceof Error && issuedJwt.message === 'user with this email already exists') {
      responce.status(400).json({ status: 'Error', message: issuedJwt.message });
      return;
    }
    responce.status(200).json({
      status: 'Success',
      ...issuedJwt,
    });
  } catch {
    //until validatiom it means validation error too. In other words 400
    responce.status(500).json({ status: 'Error', message: 'internal Error' });
    return;
  }
});
export default router;
