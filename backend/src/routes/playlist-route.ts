import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import playlistController from '../controllers/playlist-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import { Order, Restrictions, sortBy } from '../interfaces/playlist-interface.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { FileUploader } from '../models/services/file-management.ts';
import {
  createPlaylistScheme,
  getAllFromPlaylistScheme,
  getPlaylistInfoScheme,
  getPlaylistsScheme,
  reorderPlaylistScheme,
  addToPlaylist,
  removeFromPlaylist,
  updatePlaylistInfoScheme,
  updatePlaylistRestrictions,
  updatePlaylistCoverScheme,
  deletePlaylistScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type {
  ICreatePlaylist,
  IPlaylist,
  IReorder,
  IUpdatePlaylist,
} from '../interfaces/playlist-interface.ts';
import type { Request, Response, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

const fileUploader = new FileUploader();

router.get(
  ROUTES.PLAYLISTS.GET_PLAYLIST,
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
  ROUTES.PLAYLISTS.GET_PLAYLIST_COVER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getPlaylistInfoScheme.safeParse({
      playlistId: request.params.playlistId,
      userId: request.jwtPayload.user_id,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await playlistController.getPlaylistCover({
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
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? sortBy.Custom,
        order: request.query.order ?? Order.Desc,
      },
      //final test of sorting and ordering
      limit: +(request.query.limit ?? 5),
      offset: +(request.query.offset ?? 0),
    });
    console.log(validation.data?.limit, validation.data?.offset);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await playlistController.getPlaylistTracks(
      {
        playlistId: validation.data.playlistId,
        userId: validation.data.userId,
        sort: validation.data.sort,
      },
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
      name: request.query.search,
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
export type PostPlaylistRequest = Request<ParamsDictionary, unknown, ICreatePlaylist | null>;
router.post(
  ROUTES.PLAYLISTS.POST_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('cover'),
  asyncHandler(async (request: PostPlaylistRequest, response: Response) => {
    const validation = createPlaylistScheme.safeParse({
      name: request.body?.name ?? null,
      description: request.body?.description,
      owner: request.jwtPayload.user_id,
      restrictions: request.body?.restrictions ?? Restrictions.Private,
      file: request.file ?? null,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await playlistController.createPlaylist(validation.data);

    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.PLAYLISTS.POST_ADD_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { playlistId: string; trackId: string }>,
      response: Response,
    ) => {
      const validation = addToPlaylist.safeParse({
        playlistId: request.body.playlistId,
        trackId: request.body.trackId,
        userId: request.jwtPayload.user_id,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await playlistController.addTrackToPlaylist(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.post(
  ROUTES.PLAYLISTS.POST_REMOVE_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { playlistId: string; playlistTrackId: string }>,
      response: Response,
    ) => {
      const validation = removeFromPlaylist.safeParse({
        playlistTrackId: request.body.playlistTrackId,
        playlistId: request.body.playlistId,
        userId: request.jwtPayload.user_id,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await playlistController.removeTrackfromPlaylist(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.PLAYLISTS.PUT_PLAYLIST_REORDER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (request: Request<ParamsDictionary, unknown, IReorder>, response: Response) => {
      const validation = reorderPlaylistScheme.safeParse({
        playlistId: request.params.playlistId,
        userId: request.jwtPayload.user_id,
        fromIndex: request.body.fromIndex,
        toIndex: request.body.toIndex,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await playlistController.reorderPlaylistTrack(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.PLAYLISTS.PUT_PLAYLIST_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (request: Request<ParamsDictionary, unknown, IUpdatePlaylist>, response: Response) => {
      const validation = updatePlaylistInfoScheme.safeParse({
        playlistId: request.params.playlistId,
        userId: request.jwtPayload.user_id,
        name: request.body.name,
        description: request.body.description,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await playlistController.updatePlaylistInfo(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.PLAYLISTS.PUT_PLAYLIST_RESTRICTIONS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Pick<IPlaylist, 'playlistId' | 'restrictions'>>,
      response: Response,
    ) => {
      const validation = updatePlaylistRestrictions.safeParse({
        playlistId: request.params.playlistId,
        restrictions: request.body.restrictions,
        userId: request.jwtPayload.user_id,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await playlistController.updateRestrictionsById(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.PLAYLISTS.PUT_PLAYLIST_COVER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('cover'),
  asyncHandler(async (request: Request, response: Response) => {
    const validation = updatePlaylistCoverScheme.safeParse({
      playlistId: request.params.playlistId,
      userId: request.jwtPayload.user_id,
      file: request.file,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await playlistController.updateCoverById(validation.data);

    response.status(200).json(databaseResponse);
  }),
);
router.delete(
  ROUTES.PLAYLISTS.DELETE_PLAYLIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request<ParamsDictionary, unknown, null>, response: Response) => {
    const validation = deletePlaylistScheme.safeParse({
      playlistId: request.params.playlistId,
      userId: request.jwtPayload.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await playlistController.deletePlaylist(validation.data);

    response.status(200).json(databaseResponse);
  }),
);

export default router;
