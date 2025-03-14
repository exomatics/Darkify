import express from 'express';
import passport from 'passport';

import passportConfiguration from './config/authentication.ts';
import logger from './config/logger.ts';
import errorHandler from './middleware/error-handler.ts';
import authRouter from './routes/auth-route.ts';
import trackRouter from './routes/track-route.ts';
import userRouter from './routes/user-route.ts';

const PORT = process.env.PORT;
const app = express();
app.disable('x-powered-by');
app.use(express.json());
passportConfiguration(passport);
app.use(passport.initialize());
app.use('/', trackRouter);
app.use('/', userRouter);
app.use('/', authRouter);
app.use(errorHandler);
app.listen(PORT ?? 3000, () => logger.info('server is running'));
