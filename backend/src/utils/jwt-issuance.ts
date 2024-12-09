import fs from 'node:fs';
import path from 'node:path';

import jsonwebtoken from 'jsonwebtoken';

const pathToKey = path.join('src', 'config', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

function issueAccessToken(user: { id: string; hash: string }) {
  const expiresIn = '14d';

  const payload = {
    id: user.id,
    hash: user.hash,
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
function issueRefreshToken(user: { id: string; hash: string }) {
  const expiresIn = '1y';

  const payload = {
    id: user.id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: `${signedToken}`,
    expires: expiresIn,
  };
}
export { issueAccessToken, issueRefreshToken };
