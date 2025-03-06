import { Router } from 'express';
import passport from 'passport';

import userController from '../controllers/user-controller.ts';
import OperationalError from '../errors/operational-error.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { decodeBase64Url } from '../utils/utils.ts';
import { uuidScheme, updateUserScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IJwtPayload } from '../interfaces/access-token-payload.ts';
import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

router.get(
  ROUTES.USERS.GET_USER_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    if (!request.headers.authorization) {
      throw new ValidationError('jwt is gone');
    }
    const jwt = request.headers.authorization;
    const jwtPayload = jwt.split('.')[1];
    const decodedJwtPayload = decodeBase64Url(jwtPayload);
    const payloadObject: IJwtPayload = JSON.parse(decodedJwtPayload) as IJwtPayload;
    const validation = uuidScheme.safeParse(payloadObject.userId);
    if (!validation.success) {
      throw new ValidationError();
    }
    const databaseResponse = await userController.getUserInfo(payloadObject.userId.trim());
    if (databaseResponse instanceof OperationalError) {
      throw databaseResponse;
    }
    response.json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_PLAYLISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    if (!request.headers.authorization) {
      throw new ValidationError('jwt is gone');
    }
    const jwt = request.headers.authorization;
    const jwtPayload = jwt.split('.')[1];
    const decodedJwtPayload = decodeBase64Url(jwtPayload);
    const payloadObject: IJwtPayload = JSON.parse(decodedJwtPayload) as IJwtPayload;
    const validation = uuidScheme.safeParse(payloadObject.userId);
    if (!validation.success) {
      throw new ValidationError();
    }

    const databaseResponse = await userController.getUserPlaylists(payloadObject.userId.trim());
    if (databaseResponse instanceof OperationalError) {
      throw databaseResponse;
    }
    response.json(databaseResponse);
  }),
);
router.put(
  ROUTES.USERS.PUT_USER_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<
        ParamsDictionary,
        unknown,
        {
          isArtist: boolean;
          followersId: string;
          followingId: string;
          playlists: string;
          visibleUsername: string;
        }
      >,
      response: Response,
    ) => {
      if (!request.headers.authorization) {
        throw new ValidationError('jwt is gone');
      }
      const jwt = request.headers.authorization;
      const jwtPayload = jwt.split('.')[1];
      const decodedJwtPayload = decodeBase64Url(jwtPayload);
      const payloadObject: IJwtPayload = JSON.parse(decodedJwtPayload) as IJwtPayload;
      const validation = updateUserScheme.safeParse({
        userId: payloadObject.userId,
        ...request.body,
      });
      if (!validation.success) {
        throw new ValidationError();
      }

      const requestData: {
        userId: string;
        isArtist: boolean;
        followersId: string;
        followingId: string;
        playlists: string;
        visibleUsername: string;
      } = {
        userId: payloadObject.userId,
        isArtist: request.body.isArtist,
        followersId: request.body.followersId,
        followingId: request.body.followingId,
        playlists: request.body.playlists,
        visibleUsername: request.body.visibleUsername,
      };
      const databaseResponse = await userController.updateUserInfo(requestData);
      if (databaseResponse instanceof OperationalError) {
        throw databaseResponse;
      }
      response.json(databaseResponse);
    },
  ),
);
router.delete(
  ROUTES.USERS.DELETE_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    //userId validation doesn't needed? get,update,delete by id only from jwt or not?
    if (!request.headers.authorization) {
      throw new ValidationError('jwt is gone');
    }
    const jwt = request.headers.authorization;
    const jwtPayload = jwt.split('.')[1];
    const decodedJwtPayload = decodeBase64Url(jwtPayload);
    const payloadObject: IJwtPayload = JSON.parse(decodedJwtPayload) as IJwtPayload;
    const validation = uuidScheme.safeParse(payloadObject.userId);
    if (!validation.success) {
      throw new ValidationError();
    }

    await userController.deleteUser(payloadObject.userId);
    //access token or not or not only it
    //is it really stored in cookies? or headers or some other shit?
    response.clearCookie('Authorization');
    response.clearCookie('refresh-token');
    response.json({ message: 'user succesfully deleted' });
  }),
);

export default router;
