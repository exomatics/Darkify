export interface IUser {
  userId: string;
  username?: string;
  visibleUsername?: string;
  avatarId: string;
  isArtist?: boolean;
  hash: string;
  salt: string;
  email?: string;
  password: string;
  bitrate: 'low' | 'normal' | 'high' | 'veryHigh' | 'auto';
}
