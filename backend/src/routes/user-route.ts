import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import artistController from '../controllers/artist-controller.ts';
import userController from '../controllers/user-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { FileUploader } from '../models/services/file-management.ts';
import {
  uuidScheme,
  updateUserScheme,
  userFollowScheme,
  playlistFollowScheme,
  userAvatarScheme,
  updateUserSettingsScheme,
  updateLibraryPlayDate,
  createArtistScheme,
  userBannerScheme,
  singleFollowScheme,
  userFollowingScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IUser, UpdateLibraryPlayDate } from '../interfaces/user-interface.ts';
import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const fileUploader = new FileUploader();
const router = Router();

router.get(
  ROUTES.USERS.GET_ME,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.user_id);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await userController.getUserInfo(validation.data.trim());
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_ME_FOLLOWING,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userFollowingScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? 5),
      offset: +(request.query.offset ?? 0),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.getUserFollowing(
      validation.data.user_id,
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_ME_AVATAR,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.user_id);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.getUserAvatar(request.jwtPayload.user_id);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_ME_SETTINGS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.user_id);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await userController.getUserSettings(request.jwtPayload.user_id);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.USERS.GET_USER,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.user_id);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
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
      request: Request<
        ParamsDictionary,
        unknown,
        Pick<IUser, 'visible_username'> & { description?: string }
      >,
      response: Response,
    ) => {
      const validation = updateUserScheme.safeParse({
        user_id: request.jwtPayload.user_id,
        ...request.body,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const databaseResponse = await userController.updateUserInfo(validation.data.user_id, {
        visible_username: validation.data.visible_username,
        description: validation.data.description,
      });
      response.status(200).json(databaseResponse);
    },
  ),
);

router.put(
  ROUTES.USERS.PUT_ME_SETTINGS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Pick<IUser, 'bitrate'>>,
      response: Response,
    ) => {
      const validation = updateUserSettingsScheme.safeParse({
        userId: request.jwtPayload.user_id,
        ...request.body,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const databaseResponse = await userController.updateUserSettings(validation.data.userId, {
        bitrate: validation.data.bitrate,
      });
      response.status(200).json(databaseResponse);
    },
  ),
);
router.post(
  ROUTES.USERS.POST_TURN_TO_ARTIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('banner'),
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { description?: string } | null>,
      response: Response,
    ) => {
      const validation = createArtistScheme.safeParse({
        userId: request.jwtPayload.user_id,
        description: request.body?.description,
        file: request.file ?? null,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await artistController.turnToArtist(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.post(
  ROUTES.USERS.POST_FOLLOW_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      follow_id: request.params.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.followUser(
      validation.data.user_id,
      validation.data.follow_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_USER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      follow_id: request.params.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.unfollowUser(
      validation.data.user_id,
      validation.data.follow_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_FOLLOW_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      playlist_id: request.params.playlist_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.followPlaylist(
      validation.data.user_id,
      validation.data.playlist_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      playlist_id: request.params.playlist_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await userController.unfollowPlaylist(
      validation.data.user_id,
      validation.data.playlist_id,
    );
    response.status(200).json(databaseResponse);
  }),
);

router.post(
  ROUTES.USERS.POST_FOLLOW_ALBUM,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      playlist_id: request.params.album_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.followAlbum(
      validation.data.user_id,
      validation.data.playlist_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_ALBUM,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = playlistFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      playlist_id: request.params.album_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await userController.unfollowAlbum(
      validation.data.user_id,
      validation.data.playlist_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_FOLLOW_SINGLE,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = singleFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      single_id: request.params.single_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.followSingle(
      validation.data.user_id,
      validation.data.single_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.USERS.POST_UNFOLLOW_SINGLE,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = singleFollowScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      single_id: request.params.single_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await userController.unfollowSingle(
      validation.data.user_id,
      validation.data.single_id,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.USERS.PUT_EVENTS_PLAYED,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { event_data: UpdateLibraryPlayDate }>,
      response: Response,
    ) => {
      const validation = updateLibraryPlayDate.safeParse({
        user_id: request.jwtPayload.user_id,
        event_data: request.body.event_data,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      //pW9(_%1]
      const databaseResponse = await userController.updateLibraryPlayDate(
        validation.data.user_id,
        validation.data.event_data,
      );
      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.USERS.PUT_ME_AVATAR,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('avatar'),
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userAvatarScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      file: request.file,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.updateUserAvatar(
      validation.data.user_id,
      validation.data.file,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.USERS.PUT_ME_BANNER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('banner'),
  asyncHandler(async (request: Request, response: Response) => {
    const validation = userBannerScheme.safeParse({
      user_id: request.jwtPayload.user_id,
      file: request.file,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.updateUserBanner(
      validation.data.user_id,
      validation.data.file,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.delete(
  ROUTES.USERS.DELETE_ME,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.user_id);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await userController.deleteUser(validation.data);
    response.clearCookie('Authorization');
    response.clearCookie('refreshToken');
    response.status(200).json(databaseResponse);
  }),
);

export default router;
