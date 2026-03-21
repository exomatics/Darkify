import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import albumController from '../controllers/album-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import { AlbumsSortBy } from '../interfaces/album-interface.ts';
import { OrderBy, Restrictions, PlaylistSortBy } from '../interfaces/playlist-interface.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { FileUploader } from '../models/services/file-management.ts';
import {
  getMyAlbumsScheme,
  createAlbumScheme,
  updateAlbumInfoScheme,
  getAlbumInfoScheme,
  getAllFromAlbumScheme,
  addToAlbumScheme,
  removeFromAlbumScheme,
  reorderAlbumScheme,
  updateAlbumCoverScheme,
  deleteAlbumScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IUpdateAlbum } from '../interfaces/album-interface.ts';
import type { IReorder } from '../interfaces/playlist-interface.ts';
import type { Request, Response, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

const fileUploader = new FileUploader();

router.get(
  ROUTES.ALBUMS.GET_ALBUM,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getAlbumInfoScheme.safeParse({
      albumId: request.params.albumId,
      userId: request.jwtPayload.user_id,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await albumController.getAlbumInfo({
      playlistId: validation.data.albumId,
      userId: validation.data.userId,
    });
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.ALBUMS.GET_ALBUM_COVER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getAlbumInfoScheme.safeParse({
      albumId: request.params.albumId,
      userId: request.jwtPayload.user_id,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await albumController.getAlbumCover({
      playlistId: validation.data.albumId,
      userId: validation.data.userId,
    });
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.ALBUMS.GET_ALBUM_TRACKS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getAllFromAlbumScheme.safeParse({
      albumId: request.params.albumId,
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? PlaylistSortBy.Custom,
        order: request.query.order ?? OrderBy.Desc,
      },
      limit: +(request.query.limit ?? 5),
      offset: +(request.query.offset ?? 0),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await albumController.getAlbumTracks(
      {
        playlistId: validation.data.albumId,
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
  ROUTES.ALBUMS.GET_ME_ALBUMS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { sort: AlbumsSortBy }>,
      response: Response,
    ) => {
      const validation = getMyAlbumsScheme.safeParse({
        userId: request.jwtPayload.user_id,
        sort: {
          sortBy: request.query.sort ?? AlbumsSortBy.Custom,
          order: request.query.order ?? OrderBy.Desc,
        },
        limit: +(request.query.limit ?? 5),
        offset: +(request.query.offset ?? 0),
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const databaseResponse = await albumController.getUserAlbums(
        validation.data.userId,
        validation.data.sort,
        validation.data.limit,
        validation.data.offset,
      );
      response.status(200).json(databaseResponse);
    },
  ),
);
type PostPlaylistRequest = Request<ParamsDictionary, unknown, { name: string }>;
router.post(
  ROUTES.ALBUMS.POST_ALBUM,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('cover'),
  asyncHandler(async (request: PostPlaylistRequest, response: Response) => {
    const validation = createAlbumScheme.safeParse({
      owner: request.jwtPayload.user_id,
      name: request.body.name,
      restrictions: Restrictions.Private,
      file: request.file ?? null,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await albumController.createAlbum(validation.data);

    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.ALBUMS.POST_ADD_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { albumId: string; trackId: string }>,
      response: Response,
    ) => {
      const validation = addToAlbumScheme.safeParse({
        albumId: request.body.albumId,
        trackId: request.params.trackId,
        userId: request.jwtPayload.user_id,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await albumController.addTrackToAlbum({
        ...validation.data,
        playlistId: validation.data.albumId,
      });

      response.status(200).json(databaseResponse);
    },
  ),
);
router.post(
  ROUTES.ALBUMS.POST_REMOVE_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<
        ParamsDictionary,
        unknown,
        { albumId: string; albumTrackId: string; trackId: string }
      >,
      response: Response,
    ) => {
      const validation = removeFromAlbumScheme.safeParse({
        albumTrackId: request.params.albumTrackId,
        albumId: request.body.albumId,
        userId: request.jwtPayload.user_id,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await albumController.removeTrackFromAlbum({
        playlistTrackId: validation.data.albumTrackId,
        playlistId: validation.data.albumId,
        userId: validation.data.userId,
      });

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.ALBUMS.PUT_ALBUM_REORDER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Pick<IReorder, 'fromIndex' | 'toIndex'>>,
      response: Response,
    ) => {
      const validation = reorderAlbumScheme.safeParse({
        albumId: request.params.albumId,
        userId: request.jwtPayload.user_id,
        fromIndex: request.body.fromIndex,
        toIndex: request.body.toIndex,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await albumController.reorderAlbumTrack({
        ...validation.data,
        playlistId: validation.data.albumId,
      });

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.ALBUMS.PUT_ALBUM_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (request: Request<ParamsDictionary, unknown, IUpdateAlbum>, response: Response) => {
      const validation = updateAlbumInfoScheme.safeParse({
        albumId: request.params.albumId,
        userId: request.jwtPayload.user_id,
        name: request.body.name ?? null,
        releaseDate: request.body.releaseDate ?? null,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await albumController.updateAlbumInfo({
        ...validation.data,
        playlistId: validation.data.albumId,
        releaseDate: validation.data.releaseDate ? new Date(validation.data.releaseDate) : null,
      });

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.ALBUMS.PUT_ALBUM_COVER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('cover'),
  asyncHandler(async (request: Request, response: Response) => {
    const validation = updateAlbumCoverScheme.safeParse({
      albumId: request.params.albumId,
      userId: request.jwtPayload.user_id,
      file: request.file,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await albumController.updateCoverById({
      ...validation.data,
      playlistId: validation.data.albumId,
    });

    response.status(200).json(databaseResponse);
  }),
);
router.delete(
  ROUTES.ALBUMS.DELETE_ALBUM,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { keepTracks?: boolean } | undefined>,
      response: Response,
    ) => {
      const validation = deleteAlbumScheme.safeParse({
        albumId: request.params.albumId,
        userId: request.jwtPayload.user_id,
        keepTracks: request.body?.keepTracks,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await albumController.deleteAlbum({
        ...validation.data,
        playlistId: validation.data.albumId,
      });

      response.status(200).json(databaseResponse);
    },
  ),
);

export default router;
