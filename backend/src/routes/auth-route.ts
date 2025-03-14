import { Router } from 'express';
import passport from 'passport';

import authController from '../controllers/auth-controller.ts';
import NotFoundError from '../errors/not-found-error.ts';
import OperationalError from '../errors/operational-error.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { registerScheme, refreshTokenScheme, loginScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

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
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { id: string; hash: string }>,
      response: Response,
    ) => {
      const validation = refreshTokenScheme.safeParse(request.body);
      if (!validation.success) {
        throw new ValidationError(validation.error.message);
      }
      const newAccessToken = await authController.sendNewAccessTokenToUser(request.body);

      if (newAccessToken === undefined) {
        throw new NotFoundError('user with this Id does not exist');
      }
      response.status(200).json({
        status: 'Success',
        message: 'new access token has been successfully issued',
        accessToken: newAccessToken,
      });
    },
  ),
);
router.post(
  ROUTES.USERS.POST_LOGIN,
  asyncHandler(
    async (
      request: Request<
        ParamsDictionary,
        unknown,
        { username: string; email: string; password: string }
      >,
      response: Response,
    ) => {
      const validation = loginScheme.safeParse(request.body);

      if (!validation.success) {
        throw new ValidationError(validation.error.message);
      }

      const userInfo: { username: string; email: string; password: string } = request.body;
      const loginInfo = await authController.authenticateUser(userInfo);
      if (loginInfo === undefined) {
        throw new NotFoundError('user with this username or email does not exist');
      } else if (loginInfo === false) {
        throw new ValidationError('wrong password!');
      }
      response.status(200).json({
        status: 'Success',
        ...loginInfo,
      });
    },
  ),
);

router.post(
  ROUTES.USERS.POST_REGISTER,
  asyncHandler(
    async (
      request: Request<
        ParamsDictionary,
        unknown,
        {
          password: string;
          email: string;
        }
      >,
      response: Response,
    ) => {
      const validation = registerScheme.safeParse(request.body);
      if (!validation.success) {
        throw new ValidationError(validation.error.message);
      }
      const issuedJwt = await authController.registerUser(request.body);
      if (issuedJwt instanceof OperationalError) {
        throw issuedJwt;
      }
      response.status(200).json({
        status: 'Success',
        ...issuedJwt,
      });
    },
  ),
);
export default router;
