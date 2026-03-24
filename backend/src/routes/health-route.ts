import { Router } from 'express';

import database from '../config/database.ts';

import type { Request, Response } from 'express';

const router = Router();

router.get('/api/health', async (_request: Request, response: Response) => {
  try {
    await database.sequelize.authenticate();
    response.status(200).json({ status: 'ok', db: 'connected' });
  } catch {
    response.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

export default router;
