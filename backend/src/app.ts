import express from 'express';

import logger from './config/logger';
import trackRouter from './routes/track-route';
import userRouter from './routes/user-route';
const tracksRouteURL = '/api/tracks';
const userRouteURL = '/api/users';
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(tracksRouteURL, trackRouter);
app.use(userRouteURL, userRouter);
app.listen(3000, () => logger.info('server is running'));
