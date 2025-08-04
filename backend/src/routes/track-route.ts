import { Router } from 'express';
import { z } from 'zod/v4';

import trackController from '../controllers/track-controller.ts';
import ValidationError from '../errors/validation-error.ts';
import asyncHandler from '../middleware/async-handler.ts';
import { FileUploader } from '../models/services/file-management.ts';
import {
  createTrackScheme,
  getTracksScheme,
  streamTrackScheme,
  updateTrackScheme,
  uuidScheme,
} from '../validator.ts';

import { ROUTES } from './routes.ts';

import type { Request, Response } from 'express';

const fileUploader = new FileUploader();
const router = Router();

router.get(
  ROUTES.TRACKS.GET_TRACK_INFO,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.trackId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.getTrackInfo(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.TRACKS.GET_TRACKS,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = getTracksScheme.safeParse(request.params.trackName);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.getTracksByName(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
router.get(
  ROUTES.TRACKS.GET_STREAM_TRACK,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = streamTrackScheme.safeParse({
      trackId: request.params.trackId,
      userId: request.jwtPayload.user_id,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.streamTrack(validation.data);
    response.status(200).download(databaseResponse);
  }),
);
router.get(
  ROUTES.TRACKS.POST_TRACK,
  fileUploader.uploadTrackMiddleware.single('track'),
  asyncHandler(async (request: Request, response: Response) => {
    const validation = createTrackScheme.safeParse({
      ...request.body,
      track_foldername: request.file?.filename,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.createTrack(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.TRACKS.PUT_TRACK,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = updateTrackScheme.safeParse({ id: request.params.trackId, ...request.body });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.updateTrack(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
router.delete(
  ROUTES.TRACKS.DELETE_TRACK,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.trackId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    await trackController.deleteTrack(validation.data);
    response.status(200);
  }),
);

export default router;
