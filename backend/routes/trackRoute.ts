import trackController from '../controllers/trackController';
import { Router } from 'express';
const router = Router();
router.get('/:trackId', async (req, res) => {
  try {
    const response = await trackController.getTrack(req.params.trackId);
    res.json(await response);
  } catch {
    res.json('internal error');
  }
});
export default router;
