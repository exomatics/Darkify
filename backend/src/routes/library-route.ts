import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import libraryController from '../controllers/library-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import { LibrarySortBy } from '../interfaces/library-interface.ts';
import { Order } from '../interfaces/playlist-interface.ts';
import asyncHandler from '../middleware/async-handler.ts';
import {
  getLibraryPlaylistsScheme,
  getLibraryScheme,
  reorderPlaylistScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IReorder } from '../interfaces/playlist-interface.ts';
import type { Request, Response, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

router.get(
  ROUTES.LIBRARY.GET_ME_PLAYLISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryPlaylistsScheme.safeParse({
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? LibrarySortBy.Custom,
        order: request.query.order ?? Order.Asc,
      },
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getLibraryPlaylists(
      validation.data.userId,
      validation.data.sort,
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.LIBRARY.GET_ME_LIBRARY,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryScheme.safeParse({
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? LibrarySortBy.Custom,
        order: request.query.order ?? Order.Asc,
      },
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getLibrary(
      validation.data.userId,
      validation.data.sort,
    );
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.LIBRARY.PUT_PLAYLISTS_REORDER,
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
      const databaseResponse = await libraryController.reorderLibraryPlaylist(validation.data);
      response.status(200).json(databaseResponse);
    },
  ),
);
export default router;
