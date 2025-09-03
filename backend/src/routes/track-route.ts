import { Router } from 'express';
import passport from 'passport';
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

import type { Itrack } from '../interfaces/track-interface.ts';
import type { Request, Response } from 'express';
import type { ParamsDictionary, RequestHandler } from 'express-serve-static-core';

const fileUploader = new FileUploader();
const router = Router();

router.get(
  ROUTES.TRACKS.GET_TRACK_INFO,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
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
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(
    async (
      request: Request<
        ParamsDictionary,
        unknown,
        { name: Pick<Itrack, 'name'>; offset?: number; limit: number }
      >,
      response: Response,
    ) => {
      const validation = getTracksScheme.safeParse({
        name: request.params.trackName,
        limit: request.body.limit,
        offset: request.body.offset,
      });
      if (!validation.success) {
        throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
      }
      const databaseResponse = await trackController.getTracksByName(
        validation.data.name,
        validation.data.limit,
        validation.data.offset,
      );

      response.status(200).json(databaseResponse);
    },
  ),
);
router.get(
  ROUTES.TRACKS.GET_STREAM_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
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

export type PostTrackRequest = Request<
  ParamsDictionary,
  unknown,
  Pick<Itrack, 'lyrics' | 'name'> & { artists?: string }
> & { trackId?: string; files?: { track?: Express.Multer.File; cover?: Express.Multer.File } };
router.post(
  ROUTES.TRACKS.POST_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadTrackOrCoverMiddleware.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'track', maxCount: 1 },
  ]),
  asyncHandler(async (request: PostTrackRequest, response: Response) => {
    const validation = createTrackScheme.safeParse({
      artists: JSON.parse(request.body.artists ?? '[]') as string[],
      admin_id: request.jwtPayload.user_id,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      file: request.files!.cover ?? null,
      ...request.body,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.createTrack({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: request.trackId!,
      ...validation.data,
    });

    response.status(200).json(databaseResponse);
  }),
);
router.put(
  ROUTES.TRACKS.PUT_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  fileUploader.uploadImageMiddleware.single('cover'),
  asyncHandler(async (request: Request, response: Response) => {
    const validation = updateTrackScheme.safeParse({
      id: request.params.trackId,
      file: request.file ?? null,
      ...request.body,
    });
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    const databaseResponse = await trackController.updateTrack(validation.data);
    response.status(200).json(databaseResponse);
  }),
);
router.delete(
  ROUTES.TRACKS.DELETE_TRACK,
  passport.authenticate('access-token', { session: false }) as RequestHandler,
  asyncHandler(async (request: Request, response: Response) => {
    const validation = uuidScheme.safeParse(request.params.trackId);
    if (!validation.success) {
      throw new ValidationError(JSON.stringify(z.treeifyError(validation.error)));
    }
    await trackController.deleteTrack(validation.data);
    response.status(200).end();
  }),
);

export default router;
