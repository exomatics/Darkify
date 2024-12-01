import express from 'express';
import trackController from '../controllers/trackController';
const router = express.Router();
router.get('/:trackId', async (req, res) => {
  try {
    const response = await trackController.getTrack(req.params.trackId);
    res.json(await response);
  } catch {
    res.json('internal error');
  }
});
export default router;
