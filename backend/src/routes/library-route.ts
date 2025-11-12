import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import libraryController from '../controllers/library-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { getLibraryPlaylistsScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response, RequestHandler } from 'express';

const router = Router();

router.get(
  ROUTES.LIBRARY.GET_ME_PLAYLISTS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getLibraryPlaylistsScheme.safeParse({
      userId: request.jwtPayload.user_id,
      limit: +(request.query.limit ?? DEFAULT_LIMIT),
      offset: +(request.query.offset ?? DEFAULT_OFFSET),
    });
    // console.log(request.jwtPayload.user_id, validation.data);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await libraryController.getLibraryPlaylists(
      validation.data.userId,
      validation.data.limit,
      validation.data.offset,
    );
    response.status(200).json(databaseResponse);
  }),
);
