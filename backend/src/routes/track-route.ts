import { Router } from 'express';

import trackController from '../controllers/track-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { uuidScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';

const router = Router();

router.get(
  ROUTES.TRACKS.GET,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.trackId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(validation.error.flatten()));
    }
    const databaseResponse = await trackController.getTrackInfo(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
export default router;
