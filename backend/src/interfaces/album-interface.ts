import type { PlaylistAlbumsModel } from '../models/playlist-albums.ts';
import type { PlaylistModel } from '../models/playlist.ts';

export enum AlbumsSortBy {
  Released = 'date_released',
  AddDate = 'date_added',
  Alphabetic = 'name',
  Custom = 'order',
}
export enum AlbumSpecificSortBy {
  Plays = 'play_count',
}

export interface IUpdateAlbum {
  playlistId: string;
  name?: string | null;
  releaseDate?: Date | null;
}
export type PlaylistAlbumInstanceWithRelations = PlaylistModel & {
  playlist_album: PlaylistAlbumsModel;
};
