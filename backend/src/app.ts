import express from 'express';
import crypto from 'node:crypto';

import logger from './config/logger.ts';
import trackRouter from './routes/track-route.ts';
import userRouter from './routes/user-route.ts';
import authorizationMiddleware from './config/authentication.ts';
import passport from 'passport';
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use('/', trackRouter);
app.use('/', userRouter);
authorizationMiddleware(passport);
function genPassword(password: string) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt: salt,
    hash: genHash,
  };
}
logger.info(genPassword('sicret'));
app.listen(3000, () => logger.info('server is running'));
