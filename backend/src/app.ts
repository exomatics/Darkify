import express from 'express';

import logger from './config/logger.ts';
import trackRouter from './routes/track-route.ts';
import userRouter from './routes/user-route.ts';

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use('/', trackRouter);
app.use('/', userRouter);
app.listen(3000, () => logger.info('server is running'));
