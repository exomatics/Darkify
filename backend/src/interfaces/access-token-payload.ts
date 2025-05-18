export interface IJwtPayload {
  user_id: string;
  hash: string;
  iat: number;
  exp: number;
}
