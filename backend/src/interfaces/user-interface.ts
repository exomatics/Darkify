export interface IUser {
  user_id: string;
  username?: string;
  visible_username?: string;
  avatar_id: string;
  is_artist?: boolean;
  hash: string;
  salt: string;
  email?: string;
  password: string;
}
