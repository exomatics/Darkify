import express from 'express';
import passport from 'passport';

import passportConfiguration from './config/authentication.ts';
import { STATIC_DIRECTORY_PATH, PATH_TO_IMAGES } from './config/config.ts';
import logger from './config/logger.ts';
import errorHandler from './middleware/error-handler.ts';
import { jwtProcess } from './middleware/jwt-processing.ts';
import { FileUploader } from './models/services/file-management.ts';
import authRouter from './routes/auth-route.ts';
import trackRouter from './routes/track-route.ts';
import userRouter from './routes/user-route.ts';

FileUploader.init();

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(STATIC_DIRECTORY_PATH, express.static(PATH_TO_IMAGES));
passportConfiguration(passport);
app.use(passport.initialize());
app.use(jwtProcess);
app.use('/', trackRouter);
app.use('/', userRouter);
app.use('/', authRouter);
app.use(errorHandler);
app.listen(3000, () => logger.info('server is running'));
