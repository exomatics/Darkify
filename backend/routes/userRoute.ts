import express from 'express';
import userController from '../controllers/userController';
const router = express.Router();
router.get('/:userId', async (req, res) => {
  try {
    const response = await userController.getUserInfo(req.params.userId);
    res.json(response);
  } catch {
    res.json('internal error');
  }
});
export default router;
