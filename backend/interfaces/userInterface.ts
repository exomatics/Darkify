import { IPlaylist } from './playlistInterface';
export interface IUser {
  id: string;
  name: string;
  avatarUrl: string;
  isArtist: boolean;
  followers: IUser['id'][];
  following: IUser['id'][];
  playlists: IPlaylist['id'][];
  email: string;
  password: string;
}
