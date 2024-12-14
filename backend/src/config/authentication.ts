import fs from 'node:fs';
import path from 'node:path';

import passportJwt from 'passport-jwt';

import database from './database.ts';

import type { PassportStatic } from 'passport';
import type { WithSecretOrKey } from 'passport-jwt';

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

if (!PUB_KEY) {
  throw new Error('PUB_KEY not found');
}

const tokenConfig: Pick<WithSecretOrKey, 'algorithms' | 'secretOrKey'> = {
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};
const accessTokenOptions: WithSecretOrKey = {
  ...tokenConfig,
  jwtFromRequest: jwtExtract.fromAuthHeaderAsBearerToken(),
};
const refreshTokenOptions = {
  ...tokenConfig,
  jwtFromRequest: jwtExtract.fromHeader('refresh_token'),
};
const createStrategy = (options: WithSecretOrKey) => {
  return new jwtStrategy(options, (payload: { id: string; hash?: string }, done) => {
    void (async () => {
      const user = await database.userModel.findByPk(payload.id);
      if (user?.dataValues) {
        done(null, user);
      } else if (user == null) {
        done(null, false);
      } else {
        done(new Error('JwtStrategy error'), false);
      }
    })();
  });
};
const accessTokenStrategy = createStrategy(accessTokenOptions);
const refreshTokenStrategy = createStrategy(refreshTokenOptions);
const passportConfiguration = (passport: PassportStatic) => {
  passport.use('refresh-token', refreshTokenStrategy);
  passport.use('access-token', accessTokenStrategy);
};
export default passportConfiguration;
