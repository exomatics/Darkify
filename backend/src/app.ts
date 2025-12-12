import fs from 'node:fs';

import cors from 'cors';
import express from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import passportConfiguration from './config/authentication.ts';
import {
  STATIC_DIRECTORY_PATH,
  PATH_TO_OPENAPI,
  PATH_TO_UPLOADS,
  STATIC_IMAGES_PATH,
  STATIC_AUDIO_PATH,
} from './config/config.ts';
import logger from './config/logger.ts';
import errorHandler from './middleware/error-handler.ts';
import { jwtProcess } from './middleware/jwt-processing.ts';
import { rateLimiters } from './middleware/rate-limiter.ts';
import { FileUploader } from './models/services/file-management.ts';
import albumRouter from './routes/album-route.ts';
import authRouter from './routes/auth-route.ts';
import libraryRouter from './routes/library-route.ts';
import likedRouter from './routes/liked-route.ts';
import playlistRouter from './routes/playlist-route.ts';
import trackRouter from './routes/track-route.ts';
import userRouter from './routes/user-route.ts';
FileUploader.init();

const openapiFile = fs.readFileSync(PATH_TO_OPENAPI, 'utf8');
const openapiDocument = YAML.parse(openapiFile) as Record<string, unknown>;

const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(rateLimiters.globalLimiter);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/docs', express.static(PATH_TO_OPENAPI));
app.use(STATIC_DIRECTORY_PATH, express.static(PATH_TO_UPLOADS));
app.use(new RegExp(`${STATIC_IMAGES_PATH}.*`), rateLimiters.filesLimiter);
app.use(new RegExp(`${STATIC_AUDIO_PATH}.*/.*/.*`), rateLimiters.filesLimiter);

passportConfiguration(passport);
app.use(passport.initialize());
app.use(jwtProcess);
app.use('/', userRouter);
app.use('/', authRouter);
app.use('/', trackRouter);
app.use('/', playlistRouter);
app.use('/', libraryRouter);
app.use('/', likedRouter);
app.use('/', albumRouter);

app.use(errorHandler);
app.listen(3000, () => logger.info('server is running'));
