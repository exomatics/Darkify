import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import likedController from '../controllers/liked-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import { OrderBy, PlaylistSortBy } from '../interfaces/playlist-interface.ts';
import asyncHandler from '../middleware/async-handler.ts';
import {
  uuidScheme,
  addToLikedScheme,
  removeFromLikedScheme,
  reorderLikedScheme,
  getLikedScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { IReorder } from '../interfaces/playlist-interface.ts';
import type { Request, Response, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

router.get(
  ROUTES.LIKED.GET_LIKED,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.jwtPayload.user_id);

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }

    const databaseResponse = await likedController.getLikedInfo({
      userId: validation.data,
    });
    response.status(200).json(databaseResponse);
  }),
);

router.get(
  ROUTES.LIKED.GET_LIKED_TRACKS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLikedScheme.safeParse({
      userId: request.jwtPayload.user_id,
      sort: {
        sortBy: request.query.sort ?? PlaylistSortBy.Custom,
        order: request.query.order ?? OrderBy.Desc,
      },
      search: request.query.search,
      limit: +(request.query.limit ?? 5),
      offset: +(request.query.offset ?? 0),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await likedController.searchForLikedTrack(
      {
        userId: validation.data.userId,
        search: validation.data.search,
        sort: validation.data.sort,
      },
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);

router.post(
  ROUTES.LIKED.POST_ADD_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = addToLikedScheme.safeParse({
      trackId: request.params.trackId,
      userId: request.jwtPayload.user_id,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await likedController.addTrackToLiked(validation.data);

    response.status(200).json(databaseResponse);
  }),
);
router.post(
  ROUTES.LIKED.POST_REMOVE_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary, unknown, { playlistId: string; playlistTrackId: string }>,
      response: Response,
    ) => {
      const validation = removeFromLikedScheme.safeParse({
        playlistTrackId: request.params.playlistTrackId,
        userId: request.jwtPayload.user_id,
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await likedController.removeTrackfromLiked(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.put(
  ROUTES.LIKED.PUT_LIKED_REORDER,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (request: Request<ParamsDictionary, unknown, IReorder>, response: Response) => {
      const validation = reorderLikedScheme.safeParse({
        userId: request.jwtPayload.user_id,
        fromIndex: request.body.fromIndex,
        toIndex: request.body.toIndex,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await likedController.reorderLiked(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);

export default router;
