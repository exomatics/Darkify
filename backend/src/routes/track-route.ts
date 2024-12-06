import { Router } from 'express';

import trackController from '../controllers/track-controller';

import { ROUTES } from './routes';
const router = Router();

router.get(ROUTES.TRACKS.GET, async (request, response) => {
  try {
    const databaseResponse = await trackController.getTrack(request.params.trackId);
    response.json(await databaseResponse);
  } catch {
    response.json('internal error');
  }
});
export default router;
