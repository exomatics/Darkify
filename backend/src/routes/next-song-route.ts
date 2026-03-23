import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod/v4';

import nextSongController from '../controllers/next-song-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { nextSongSchema } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response, RequestHandler } from 'express';
const router = Router();

router.post(
  ROUTES.NEXT_SONG.POST_NEXT_SONG,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = nextSongSchema.safeParse({
      ...request.body,
      userId: request.jwtPayload.user_id,
    });

    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await nextSongController.getNextSong(validation.data);
    response.status(200).json(databaseResponse);
  }),
);

export default router;
