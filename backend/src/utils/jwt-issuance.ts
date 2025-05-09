import fs from 'node:fs';
import path from 'node:path';

import jsonwebtoken from 'jsonwebtoken';

import { ACCESS_TOKEN_EXPIRE_DATE, REFRESH_TOKEN_EXPIRE_DATE } from '../config/config.ts';

const pathToKey = path.join('src', 'config', 'id_rsa_priv.pem');
const PRIV_KEY: jsonwebtoken.PrivateKey = fs.readFileSync(pathToKey, 'utf8');

function issueToken(userInfo: { userId: string; hash?: string }, expiresIn: string) {
  const payload = userInfo.hash
    ? {
        userId: userInfo.userId,
        hash: userInfo.hash,
      }
    : {
        userId: userInfo.userId,
      };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: 'RS256',
  } as jsonwebtoken.SignOptions);
  if (userInfo.hash) {
    return {
      token: `Bearer ${signedToken}`,
      expires: expiresIn,
    };
  }
  return {
    token: signedToken,
    expires: expiresIn,
  };
}

function issueAccessToken(userInfo: { userId: string; hash: string }) {
  return issueToken(userInfo, ACCESS_TOKEN_EXPIRE_DATE);
}
function issueRefreshToken(userInfo: { userId: string; hash?: string }) {
  return issueToken({ userId: userInfo.userId }, REFRESH_TOKEN_EXPIRE_DATE);
}
function issueBothTokens(userInfo: { userId: string; hash: string }) {
  const accessTokenObject = issueAccessToken(userInfo);
  const refreshTokenObject = issueRefreshToken(userInfo);
  return { accessToken: accessTokenObject, refreshToken: refreshTokenObject };
}
export { issueAccessToken, issueRefreshToken, issueBothTokens };
