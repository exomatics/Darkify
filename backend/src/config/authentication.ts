import fs from 'node:fs';
import path from 'node:path';

import passportJwt from 'passport-jwt';

import database from './database.ts';

import type { PassportStatic } from 'passport';
import type { StrategyOptionsWithSecret } from 'passport-jwt';

const jwtStrategy = passportJwt.Strategy;
const jwtExtract = passportJwt.ExtractJwt;
const pathToKey = path.join('src', 'config');
let PUB_KEY;
try {
  PUB_KEY = fs.readFileSync(path.join(pathToKey, 'id_rsa_pub.pem'), 'utf8');
} catch {
  throw new Error(
    'Error occured while reading public key. Make sure you generated key pair with npm run generateKeys',
  );
}
const tokenConfig = {
  secretOrKey: PUB_KEY,
  algoritms: ['RS256'],
};
const accessTokenOptions = {
  jwtFromRequest: jwtExtract.fromAuthHeaderAsBearerToken(),
  ...tokenConfig,
};
const refreshTokenOptions = {
  jwtFromRequest: jwtExtract.fromHeader('refresh_token'),
  ...tokenConfig,
};
const createStrategy = (options: StrategyOptionsWithSecret) =>
  new jwtStrategy(options, async (payload, done) => {
    try {
      const user = await database.userModel.findByPk(payload.id);
      return user ? done(null, user) : done(null, false);
    } catch (error) {
      return done(error);
    }
  });
const accessTokenStrategy = createStrategy(accessTokenOptions);
const refreshTokenStrategy = createStrategy(refreshTokenOptions);
const passportConfiguration = (passport: PassportStatic) => {
  passport.use('refresh-token', refreshTokenStrategy);
  passport.use('access-token', accessTokenStrategy);
};
export default passportConfiguration;
