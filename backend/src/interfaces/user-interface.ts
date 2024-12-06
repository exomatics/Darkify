import type { IPlaylist } from './playlist-interface';
export interface IUser {
  id: string;
  name: string;
  avatarUrl: string;
  isArtist: boolean;
  followers: Array<IUser['id']>;
  following: Array<IUser['id']>;
  playlists: Array<IPlaylist['id']>;
  email: string;
  password: string;
}
