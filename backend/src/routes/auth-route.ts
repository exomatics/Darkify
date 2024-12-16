import { Router } from 'express';
import passport from 'passport';

import authController from '../controllers/auth-controller.ts';

import { ROUTES } from './routes.ts';

import type { IUser } from '../interfaces/user-interface.ts';
import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
interface ILoginRequestBody {
  username: string;
  email: string;
  password: string;
}
interface IIssueAccessTokenRequestBody {
  id: string;
  hash: string;
}

// function refreshTokenAuthentication(request: Request, response: Response, next: NextFunction) {
//   passport.authenticate(
//     'refresh-token',
//     { session: false },
//     function (error: unknown, user?: false | null) {
//       if (error) {
//         next(error);
//         return;
//       }
//       if (!user) {
//         return response.json({ status: 'Error', message: 'refresh token is compromised' }).end();
//       }
//       next();
//     },
//   )(request, response, next);
// }

const router = Router();
router.post(
  ROUTES.USERS.POST_ISSUE_ACCESS_TOKEN,
  passport.authenticate('refresh-token', { session: false }) as RequestHandler,
  async function (
    request: Request<ParamsDictionary, unknown, IIssueAccessTokenRequestBody>,
    response: Response,
  ) {
    try {
      const newAccessToken = await authController.sendNewAccessTokenToUser(request.body);

      if (newAccessToken === undefined) {
        response.status(400).json({ status: 'Error', message: 'user with this Id does not exist' });
        return;
      }
      response.status(200).json({
        status: 'Success',
        message: 'new access token has been successfully issued',
        accessToken: newAccessToken,
      });
      return;
    } catch {
      //until validatiom it means validation error too. In other words 400
      response.status(500).json({ status: 'Error', message: 'internal error' });
      return;
    }
  },
);
router.post(
  ROUTES.USERS.POST_LOGIN,
  async function (
    request: Request<ParamsDictionary, unknown, ILoginRequestBody>,
    response: Response,
  ) {
    try {
      const userInfo: { username: string; email: string; password: string } = request.body;
      const loginInfo = await authController.authenticateUser(userInfo);
      if (loginInfo === undefined) {
        response
          .status(404)
          .json({ status: 'Error', message: 'user with this username or email does not exist' });
        return;
      } else if (loginInfo === false) {
        response.status(400).json({ status: 'Error', message: 'wrong password!' });
        return;
      }
      response.status(200).json({
        status: 'Success',
        ...loginInfo,
      });
    } catch {
      //until validatiom it means validation error too. In other words 400
      response.status(500).json({ status: 'Error', message: 'internal error' });
      return;
    }
  },
);

router.post(
  ROUTES.USERS.POST_REGISTER,
  async function (request: Request<ParamsDictionary, unknown, IUser>, response: Response) {
    try {
      const issuedJwt = await authController.registerUser(request.body);
      if (
        issuedJwt instanceof Error &&
        issuedJwt.message === 'user with this email already exists'
      ) {
        response.status(400).json({ status: 'Error', message: issuedJwt.stack });
        return;
      }
      response.status(200).json({
        status: 'Success',
        ...issuedJwt,
      });
    } catch (error) {
      //until validatiom it means validation error too. In other words 400
      response.json({
        Error: 'internal error 2',
        message: error instanceof Error ? error.stack : '',
      });
      return;
    }
  },
);
export default router;
