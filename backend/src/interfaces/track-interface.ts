import type { PlaylistAlbumsModel } from '../models/playlist-albums.ts';
import type { PlaylistTrackModel } from '../models/playlist-tracks.ts';
import type { PlaylistModel } from '../models/playlist.ts';
import type { TrackModel } from '../models/track.ts';
import type { UserModel } from '../models/user.ts';

export interface ITrack {
  id: string;
  admin_id: string;
  name: string;
  album_id?: string | null;
  artists: string[];
  lyrics?: string | null;
  play_count: number;
  deleted?: boolean;
  duration: number;
  cover_id: string | null;
}
export interface UpdateTrack {
  id: string;
  userId: string;
  name?: string;
  artists?: string[];
  lyrics?: string | null;
  cover_id?: string | null;
  file: Express.Multer.File | null;
}

export type TrackResult = Omit<ITrack, 'artists' | 'cover_id'> & {
  artists: { id: string; visible_username: string }[];
  album: { id: string; name: string };
  is_liked: boolean;
  cover_url: string | null;
};
export type TrackWithAlbum = TrackModel & {
  album?: PlaylistModel & { playlist_album: PlaylistAlbumsModel };
};

export type TrackWithRelations = TrackModel & {
  users: UserModel[];
  playlists?: (PlaylistModel & { playlist_track: PlaylistTrackModel })[];
  album?: PlaylistModel[];
};
export type AllowedAudioMimetypes =
  | 'audio/mpeg'
  | 'audio/flac'
  | 'audio/x-flac'
  | 'audio/wav'
  | 'audio/ogg'
  | 'audio/mp4';
export type AllowedAudioExtensions = '.mp3' | '.wav' | '.flac' | '.ogg' | '.m4a';
