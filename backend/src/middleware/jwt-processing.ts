import { decodeBase64Url } from '../utils/utils.ts';

import type { IJwtPayload } from '../interfaces/access-token-payload.ts';
import type { NextFunction, Request, Response } from 'express';

export function jwtProcess(request: Request, response: Response, next: NextFunction) {
  const jwt = request.headers.authorization;
  if (!jwt) {
    next();
    return;
  }
  const jwtPayload = jwt.split('.')[1];
  const decodedJwtPayload = decodeBase64Url(jwtPayload);
  const payloadObject: IJwtPayload = JSON.parse(decodedJwtPayload) as IJwtPayload;
  request.jwtPayload = payloadObject;
  next();
}
