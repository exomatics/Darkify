import { Router } from 'express';

import trackController from '../controllers/track-controller.ts';

import { ROUTES } from './routes.ts';
const router = Router();

router.get(ROUTES.TRACKS.GET, async (request, response) => {
  try {
    const databaseResponse = await trackController.getTrackInfo(request.params.trackId);
    response.json(databaseResponse);
  } catch {
    response.json('internal error');
  }
});
export default router;
