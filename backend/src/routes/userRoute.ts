import userController from '../controllers/userController';
import { Router } from 'express';
import { ROUTES } from './routes';
const router = Router();

router.get(ROUTES.USERS.GET, async (req, res) => {
  try {
    const response = await userController.getUserInfo(req.params.userId);
    res.json(response);
  } catch {
    res.json('internal error');
  }
});
export default router;
