export interface IUser {
  userId: string;
  username: string;
  visibleUsername: string;
  avatarId: string;
  isArtist: boolean;
  followersId: string;
  followingId: string;
  playlists: string;
  hash: string;
  salt: string;
  email: string;
  password: string;
}
