import type { IJwtPayload } from '../interfaces/access-token-payload.ts';

declare global {
  namespace Express {
    interface Request {
      jwtPayload: IJwtPayload;
    }
  }
}
