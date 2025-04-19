import ValidationError from '../errors/validation-error.ts';
import { decodeBase64Url } from '../utils/utils.ts';

import type { IJwtPayload } from '../interfaces/access-token-payload.ts';
import type { NextFunction, Request, Response } from 'express';

export function jwtProcess(request: Request, response: Response, next: NextFunction) {
  if (!request.headers.authorization) {
    throw new ValidationError('jwt is gone');
  }
  const jwt = request.headers.authorization;
  const jwtPayload = jwt.split('.')[1];
  const decodedJwtPayload = decodeBase64Url(jwtPayload);
  const payloadObject: IJwtPayload = JSON.parse(decodedJwtPayload) as IJwtPayload;
  request.jwtPayload = payloadObject;
  next();
}
