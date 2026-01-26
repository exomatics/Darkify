import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import { DEFAULT_OFFSET } from '../config/config.ts';
import artistController from '../controllers/artist-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { FileUploader } from '../models/services/file-management.ts';
import {
  createArtistScheme,
  getArtistLikedScheme,
  getArtistRecentAlbums,
  getArtistRecentSingles,
  getArtistScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

const router = Router();
const fileUploader = new FileUploader();

router.post(
  ROUTES.ARTISTS.POST_ARTIST,
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
router.get(
  ROUTES.ARTISTS.GET_ARTIST,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary | { artistId: string }, unknown, null>,
      response: Response,
    ) => {
      const validation = getArtistScheme.safeParse({
        userId: request.jwtPayload.user_id,
        artistId: request.params.artistId,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await artistController.getArtistInfo(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);
router.get(
  ROUTES.ARTISTS.GET_ARTIST_LIKED,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary | { artistId: string }, unknown, null>,
      response: Response,
    ) => {
      const validation = getArtistLikedScheme.safeParse({
        userId: request.jwtPayload.user_id,
        artistId: request.params.artistId,
        limit: 10,
        offset: +(request.query.offset ?? DEFAULT_OFFSET),
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const databaseResponse = await artistController.getLikedFromArtist(
        validation.data,
        validation.data.limit,
        validation.data.offset,
      );
      response.status(200).json(databaseResponse);
    },
  ),
);
router.get(
  ROUTES.ARTISTS.GET_RECENT_ALBUMS,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary | { artistId: string }, unknown, null>,
      response: Response,
    ) => {
      const validation = getArtistRecentAlbums.safeParse({
        userId: request.jwtPayload.user_id,
        artistId: request.params.artistId,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const databaseResponse = await artistController.getRecentArtistAlbums(validation.data);
      response.status(200).json(databaseResponse);
    },
  ),
);
router.get(
  ROUTES.ARTISTS.GET_RECENT_SINGLES,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<ParamsDictionary | { artistId: string }, unknown, null>,
      response: Response,
    ) => {
      const validation = getArtistRecentSingles.safeParse({
        userId: request.jwtPayload.user_id,
        artistId: request.params.artistId,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }

      const databaseResponse = await artistController.getRecentSingles(validation.data);
      response.status(200).json(databaseResponse);
    },
  ),
);
export default router;
