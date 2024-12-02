import userController from '../controllers/userController';
import { Router } from 'express'
const router = Router();
router.get('/:userId', async (req, res) => {
  try {
    const response = await userController.getUserInfo(req.params.userId);
    res.json(response);
  } catch {
    res.json('internal error');
  }
});
export default router;
