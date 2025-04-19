export interface IJwtPayload {
  userId: string;
  hash: string;
  iat: number;
  exp: number;
}
