import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import authController from '../controllers/auth-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { registerScheme, refreshTokenScheme, loginScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IUser } from '../interfaces/user-interface.ts';
import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();
router.post(
  ROUTES.USERS.POST_ISSUE_ACCESS_TOKEN,
  passport.authenticate('refresh-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request<ParamsDictionary, unknown>, response: Response) => {
    const validation = refreshTokenScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      hash: request.jwtPayload.hash,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const newAccessToken = await authController.sendNewAccessTokenToUser(validation.data);

    response.status(200).json({
      accessToken: newAccessToken,
    });
  }),
);
router.post(
  ROUTES.USERS.POST_LOGIN,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Pick<IUser, 'username' | 'email' | 'password'>>,
      response: Response,
    ) => {
      const validation = loginScheme.safeParse(request.body);
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const userInfo = validation.data;
      const tokens = await authController.authenticateUser(userInfo);
      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      response.status(200).json({
        ...tokens.accessToken,
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
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const tokens = await authController.registerUser(validation.data);

      response.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      response.status(200).json({
        ...tokens.accessToken,
      });
    },
  ),
);
export default router;
