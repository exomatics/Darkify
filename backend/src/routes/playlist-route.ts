import { Router } from 'express';
import { ROUTES } from './routes.ts';
import passport from 'passport';
import asyncHandler from '../middleware/async-handler.ts';
import {
  createPlaylistScheme,
  getAllFromPlaylistScheme,
  getPlaylistInfoScheme,
  getPlaylistsScheme,
} from '../validator.ts';
import ValidationError from '../errors/validation-error.ts';
import { z } from 'zod/v4';

import type { Request, Response, RequestHandler } from 'express';
import playlistController from '../controllers/playlist-controller.ts';
import { ICreatePlaylist, IPlaylist, Order, sortBy } from '../interfaces/playlist-interface.ts';
import { FileUploader } from '../models/services/file-management.ts';
import { ParamsDictionary } from 'express-serve-static-core';
const router = Router();

const fileUploader = new FileUploader();

router.get(
  ROUTES.PLAYLISTS.GET_PLAYLIST_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getPlaylistInfoScheme.safeParse({
      playlistId: request.params.playlistId,
      userId: request.jwtPayload.user_id,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await playlistController.getPlaylistInfo({
      playlistId: validation.data.playlistId,
      userId: validation.data.userId,
    });
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.PLAYLISTS.GET_PLAYLIST_TRACKS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getAllFromPlaylistScheme.safeParse({
      playlistId: request.params.playlistId,
      sort: {
        sortBy: request.query.sort ?? sortBy.Custom,
        order: request.query.order ?? Order.Desc,
      },
      limit: +(request.query.limit ?? 5),
      offset: +(request.query.offset ?? 0),
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await playlistController.getPlaylistTracks(
      { playlistId: validation.data.playlistId, sort: validation.data.sort },
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);

router.get(
  ROUTES.PLAYLISTS.GET_PLAYLISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getPlaylistsScheme.safeParse({
      userId: request.jwtPayload.user_id,
      name: request.params.name,
      limit: +(request.query.limit ?? 5),
      offset: +(request.query.offset ?? 0),
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await playlistController.getPlaylistsByName(
      { name: validation.data.name, userId: validation.data.userId },
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);
export type PostPlaylistRequest = Request<ParamsDictionary, unknown, ICreatePlaylist>;
router.post(
  ROUTES.PLAYLISTS.POST_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('cover'),
  asyncHandler(async (request: PostPlaylistRequest, response: Response) => {
    const validation = createPlaylistScheme.safeParse({
      name: request.body.name,
      description: request.body.description,
      owner: request.jwtPayload.user_id,
      restrictions: request.body.restrictions,
      file: request.file,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await playlistController.createPlaylist(validation.data);

    response.status(200).json(databaseResponse);
  }),
);

export default router;
