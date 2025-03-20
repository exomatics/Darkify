import { Router } from 'express';
import passport from 'passport';

import userController from '../controllers/user-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import {
  uuidScheme,
  updateUserScheme,
  userFollowScheme,
  playlistFollowScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IUser } from '../interfaces/user-interface.ts';
import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

router.get(
  ROUTES.USERS.GET_USER_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    const databaseResponse = await userController.getUserInfo(validation.data.trim());
    response.json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_USER_FOLLOWING,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    const databaseResponse = await userController.getUserFollowing(validation.data.trim());
    response.json(databaseResponse);
  }),
);

router.put(
  ROUTES.USERS.PUT_USER_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Pick<IUser, 'visibleUsername'>>,
      response: Response,
    ) => {
      const validation = updateUserScheme.safeParse({
        userId: request.jwtPayload.userId,
        ...request.body,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten()));
      }
      const databaseResponse = await userController.updateUserInfo(validation.data.userId, {
        visibleUsername: validation.data.visibleUsername,
      });
      response.status(200).json(databaseResponse);
    },
  ),
);
router.post(
  ROUTES.USERS.POST_FOLLOW_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      followId: request.params.followUserId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    await userController.followUser(validation.data.userId, validation.data.followId);
    response.status(200);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      followId: request.params.unfollowUserId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    await userController.unfollowUser(validation.data.userId, validation.data.followId);
    response.status(200);
  }),
);
router.post(
  ROUTES.USERS.POST_FOLLOW_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      playlistId: request.params.followUserId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    await userController.followPlaylist(validation.data.userId, validation.data.playlistId);
    response.status(200);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      playlistId: request.params.followUserId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    await userController.unfollowPlaylist(validation.data.userId, validation.data.playlistId);
    response.status(200);
  }),
);
router.delete(
  ROUTES.USERS.DELETE_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    await userController.deleteUser(validation.data);
    response.clearCookie('Authorization');
    response.clearCookie('refresh-token');
    response.status(200);
  }),
);

export default router;
