import jwt from 'passport-jwt';
import path from 'path';
import fs from 'node:fs';
import database from './database.ts';
import { PassportStatic } from 'passport';
const __dirname = import.meta.dirname;
const jwtStrategy = jwt.Strategy;
const jwtExtract = jwt.ExtractJwt;
const pathToKey = path.join(__dirname, 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf-8');
const options = {
  jwtFromRequest: jwtExtract.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algoritms: ['R256'],
};
const strategy = new jwtStrategy(options, async (payload, done) => {
  try {
    const user = await database.userModel.findByPk(payload.sub);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch {
    return new Error('error');
  }
});
const passportConfiguration = (passport: PassportStatic) => {
  passport.use(strategy);
};
export default passportConfiguration;
