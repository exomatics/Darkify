import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import libraryController from '../controllers/library-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import { LibrarySortBy } from '../interfaces/library-interface.ts';
import { OrderBy } from '../interfaces/playlist-interface.ts';
import asyncHandler from '../middleware/async-handler.ts';
import {
  getLibraryArtistsScheme,
  getLibraryItemsScheme,
  getLibraryScheme,
  reorderLibraryReleases,
  reorderPlaylistScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IReleasesReorder } from '../interfaces/library-interface.ts';
import type { IReorder } from '../interfaces/playlist-interface.ts';
import type { Request, Response, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

router.get(
  ROUTES.LIBRARY.GET_ME_LIBRARY,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryScheme.safeParse({
      userId: request.jwtPayload.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getLibrary(validation.data.userId);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.LIBRARY.GET_ME_ARTISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryArtistsScheme.safeParse({
      userId: request.jwtPayload.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getArtists(validation.data.userId);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.LIBRARY.GET_ME_PLAYLISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryItemsScheme.safeParse({
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? LibrarySortBy.Custom,
        order: request.query.order ?? OrderBy.Asc,
      },
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getPlaylists(
      {
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
  ROUTES.LIBRARY.GET_ME_RELEASES,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryItemsScheme.safeParse({
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? LibrarySortBy.Custom,
        order: request.query.order ?? OrderBy.Asc,
      },
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getReleases(
      {
        userId: validation.data.userId,
        sort: validation.data.sort,
      },
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.LIBRARY.PUT_ME_PLAYLISTS_REORDER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Omit<IReorder, 'playlistId'>>,
      response: Response,
    ) => {
      const validation = reorderPlaylistScheme.safeParse({
        playlistId: request.params.playlistId,
        userId: request.jwtPayload.user_id,
        fromIndex: request.body.fromIndex,
        toIndex: request.body.toIndex,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await libraryController.reorderPlaylists(validation.data);
      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.LIBRARY.PUT_ME_RELEASES_REORDER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, Omit<IReleasesReorder, 'playlistId'>>,
      response: Response,
    ) => {
      const validation = reorderLibraryReleases.safeParse({
        releaseId: request.params.releaseId,
        userId: request.jwtPayload.user_id,
        releaseType: request.body.releaseType,
        fromIndex: request.body.fromIndex,
        toIndex: request.body.toIndex,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await libraryController.reorderReleases(validation.data);
      response.status(200).json(databaseResponse);
    },
  ),
);
export default router;
