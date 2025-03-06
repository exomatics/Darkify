import { Router } from 'express';

import trackController from '../controllers/track-controller.ts';
import OperationalError from '../errors/operational-error.ts';
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
      response.status(400).json({ status: 'Error', message: validation.error.issues });
      return;
    }
    const databaseResponse = await trackController.getTrackInfo(request.params.trackId);
    if (databaseResponse instanceof OperationalError) {
      throw databaseResponse;
    }
    response.status(200).json(databaseResponse);
  }),
);
export default router;
