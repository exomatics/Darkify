import express from 'express';
import userRouter from './routes/userRoute.ts';
import trackRouter from './routes/trackRoute.ts';
import logger from './config/logger.ts';

const app = express();
app.use(express.json());
app.use('/api/tracks', trackRouter);
app.use('/api/users', userRouter);
app.listen(3000, () => logger.info('server is running'));
