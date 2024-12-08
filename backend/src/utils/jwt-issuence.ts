import fs from 'node:fs';
import path from 'node:path';

import jsonwebtoken from 'jsonwebtoken';

const pathToKey = path.join('./', '..', 'config', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

function issueJWT(user: { id: string }) {
  const id = user.id;

  const expiresIn = '30d';

  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
  };
}
export default issueJWT;
