import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import globalSearchController from '../controllers/global-search-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { searchScheme, searchWithPaginationScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';
import type { RequestHandler } from 'express-serve-static-core';

const router = Router();

router.get(
  ROUTES.GLOBAL_SEARCH.GET_ALL,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = searchScheme.safeParse({
      search: request.query.search,
      userId: request.jwtPayload.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await globalSearchController.searchGlobally({
      searchString: validation.data.search,
      userId: validation.data.userId,
    });

    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.GLOBAL_SEARCH.GET_TRACKS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = searchWithPaginationScheme.safeParse({
      search: request.query.search,
      userId: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await globalSearchController.searchForTracks(
      {
        searchString: validation.data.search,
        userId: validation.data.userId,
      },
      validation.data.limit,
      validation.data.offset,
    );

    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.GLOBAL_SEARCH.GET_ARTISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = searchWithPaginationScheme.safeParse({
      search: request.query.search,
      userId: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await globalSearchController.searchForArtists(
      {
        searchString: validation.data.search,
        userId: validation.data.userId,
      },
      validation.data.limit,
      validation.data.offset,
    );

    response.status(200).json(databaseResponse);
  }),
);

router.get(
  ROUTES.GLOBAL_SEARCH.GET_PLAYLISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = searchWithPaginationScheme.safeParse({
      search: request.query.search,
      userId: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await globalSearchController.searchForPlaylists(
      {
        searchString: validation.data.search,
        userId: validation.data.userId,
      },
      validation.data.limit,
      validation.data.offset,
    );

    response.status(200).json(databaseResponse);
  }),
);

router.get(
  ROUTES.GLOBAL_SEARCH.GET_ALBUMS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = searchWithPaginationScheme.safeParse({
      search: request.query.search,
      userId: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await globalSearchController.searchForAlbums(
      {
        searchString: validation.data.search,
        userId: validation.data.userId,
      },
      validation.data.limit,
      validation.data.offset,
    );

    response.status(200).json(databaseResponse);
  }),
);

router.get(
  ROUTES.GLOBAL_SEARCH.GET_ALBUMS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = searchWithPaginationScheme.safeParse({
      search: request.query.search,
      userId: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await globalSearchController.searchForUsers(
      {
        searchString: validation.data.search,
        userId: validation.data.userId,
      },
      validation.data.limit,
      validation.data.offset,
    );

    response.status(200).json(databaseResponse);
  }),
);
export default router;
