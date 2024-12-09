import fs from 'node:fs';
import path from 'node:path';

import passportJwt from 'passport-jwt';

import database from './database.ts';

import type { PassportStatic } from 'passport';

const jwtStrategy = passportJwt.Strategy;
const jwtExtract = passportJwt.ExtractJwt;
const pathToKey = path.join('src', 'config');
const PUB_KEY = fs.readFileSync(path.join(pathToKey, 'id_rsa_pub.pem'), 'utf8');
const options = {
  jwtFromRequest: jwtExtract.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algoritms: ['R256'],
};
const strategy = new jwtStrategy(options, async (payload, done) => {
  try {
    const user = await database.userModel.findByPk(payload.id);
    //passportjs требует null для работы
    // eslint-disable-next-line unicorn/no-null
    return user ? done(null, user) : done(null, false);
  } catch {
    return new Error('error');
  }
});
const passportConfiguration = (passport: PassportStatic) => {
  passport.use(strategy);
};
export default passportConfiguration;
