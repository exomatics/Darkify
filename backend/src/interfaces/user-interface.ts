import type { Bitrate } from '../types/bitrate-type.ts';

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
  bitrate: Bitrate;
}

export enum LibrarySections {
  PLAYLISTS = 'playlists',
  ALBUMS = 'albums',
  ARTISTS = 'artists',
}

export type UpdateLibraryPlayDate =
  | { section: LibrarySections.PLAYLISTS; playlist_id: string }
  | { section: LibrarySections.ALBUMS; album_id: string }
  | { section: LibrarySections.ARTISTS; artist_id: string };
