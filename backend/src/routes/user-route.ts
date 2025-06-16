import { Router } from 'express';
import multer from 'multer';
import passport from 'passport';

import userController from '../controllers/user-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import {
  uuidScheme,
  updateUserScheme,
  userFollowScheme,
  playlistFollowScheme,
  userAvatarScheme,
  updateUserSettingsScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IUser } from '../interfaces/user-interface.ts';
import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { FileFilterCallback } from 'multer';

const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter(request: Request, file, callback: FileFilterCallback) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      callback(null, true);
    } else {
      const fileValidationError = 'file is not an png or jpeg image';
      callback(new ValidationError(fileValidationError));
    }
  },
  limits: {
    fileSize: 1000 * 1000 * 100,
  },
});
const router = Router();

router.get(
  ROUTES.USERS.GET_ME,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    const databaseResponse = await userController.getUserInfo(validation.data.trim());
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_ME_FOLLOWING,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.getUserFollowing(validation.data.trim());
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_ME_AVATAR,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.getUserAvatar(request.jwtPayload.userId);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_ME_SETTINGS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    const databaseResponse = await userController.getUserSettings(request.jwtPayload.userId);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.getUserInfo(validation.data.trim());
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.USERS.PUT_ME,
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
router.put(
  ROUTES.USERS.PUT_ME_SETTINGS,
  // passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Pick<IUser, 'bitrate'>>,
      response: Response,
    ) => {
      const validation = updateUserSettingsScheme.safeParse({
        userId: request.jwtPayload.userId,
        ...request.body,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(validation.error.flatten()));
      }

      const databaseResponse = await userController.updateUserSettings(validation.data.userId, {
        bitrate: validation.data.bitrate,
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
      followId: request.params.userId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.followUser(
      validation.data.userId,
      validation.data.followId,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      followId: request.params.userId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.unfollowUser(
      validation.data.userId,
      validation.data.followId,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_FOLLOW_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      playlistId: request.params.playlistId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.followPlaylist(
      validation.data.userId,
      validation.data.playlistId,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      userId: request.jwtPayload.userId,
      playlistId: request.params.playlistId,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.unfollowPlaylist(
      validation.data.userId,
      validation.data.playlistId,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.USERS.PUT_ME_AVATAR,
  uploadImage.single('avatar'),
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userAvatarScheme.safeParse({
      userId: request.jwtPayload.userId,
      file: request.file,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.updateUserAvatar(
      request.jwtPayload.userId,
      validation.data.file,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.delete(
  ROUTES.USERS.DELETE_ME,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.userId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }

    const databaseResponse = await userController.deleteUser(validation.data);
    response.clearCookie('Authorization');
    response.clearCookie('refresh-token');
    response.status(200).json(databaseResponse);
  }),
);

export default router;
