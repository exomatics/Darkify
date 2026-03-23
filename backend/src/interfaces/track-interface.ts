import type { PlaylistAlbumsModel } from '../models/playlist-albums.ts';
import type { PlaylistTrackModel } from '../models/playlist-tracks.ts';
import type { PlaylistModel } from '../models/playlist.ts';
import type { TrackModel } from '../models/track.ts';
import type { UserModel } from '../models/user.ts';

interface ITrack {
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
interface UpdateTrack {
  id: string;
  userId: string;
  name?: string;
  artists?: string[];
  lyrics?: string | null;
  cover_id?: string | null;
  file: Express.Multer.File | null;
}

type TrackResult = Omit<ITrack, 'artists' | 'cover_id' | 'admin_id'> & {
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
export { ITrack, UpdateTrack, TrackResult };
