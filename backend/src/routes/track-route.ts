import { Router } from 'express';

import trackController from '../controllers/track-controller.ts';
import { uuidScheme } from '../validator.ts';

import { ROUTES } from './routes.ts';
const router = Router();

router.get(ROUTES.TRACKS.GET, async (request, response) => {
  try {
    const validation = uuidScheme.safeParse(request.params.trackId);
    if (!validation.success) {
      response.status(400).json({ status: 'Error', message: validation.error.issues });
      return;
    }
    const databaseResponse = await trackController.getTrackInfo(request.params.trackId);
    if (
      databaseResponse instanceof Error &&
      databaseResponse.message === 'Track with this id does not exist'
    ) {
      response.status(400).json({ status: 'Error', message: databaseResponse.message });
      return;
    }
    response.json(databaseResponse);
  } catch {
    response.status(500).json({ status: 'Error', message: 'internal Error' });
  }
});
export default router;
