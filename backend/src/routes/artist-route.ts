import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import artistController from '../controllers/artist-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { FileUploader } from '../models/services/file-management.ts';
import { createArtistScheme } from '../validator.ts';

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
      });

      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await artistController.turnToArtist(validation.data);

      response.status(200).json(databaseResponse);
    },
  ),
);

export default router;
