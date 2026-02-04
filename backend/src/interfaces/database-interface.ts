import type { ArtistModel } from '../models/artists.ts';
import type { LibraryPlaylistsModel } from '../models/library-playlists.ts';
import type { LibrarySinglesModel } from '../models/library-singles.ts';
import type { PlaylistAlbumsModel } from '../models/playlist-albums.ts';
import type { PlaylistFollowersModel } from '../models/playlist-followers.ts';
import type { PlaylistTrackModel } from '../models/playlist-tracks.ts';
import type { PlaylistModel } from '../models/playlist.ts';
import type { TrackArtistsModel } from '../models/track-artists.ts';
import type { TrackModel } from '../models/track.ts';
import type { UserFollowersModel } from '../models/user-followers.ts';
import type { UserFollowingModel } from '../models/user-following.ts';
import type { UserModel } from '../models/user.ts';
import type { ModelStatic, Sequelize } from 'sequelize';

export interface Idb {
  sequelize: Sequelize;
  playlistModel: ModelStatic<PlaylistModel>;
  playlistTrackModel: ModelStatic<PlaylistTrackModel>;
  playlistFollowersModel: ModelStatic<PlaylistFollowersModel>;
  trackModel: ModelStatic<TrackModel>;
  trackArtistsModel: ModelStatic<TrackArtistsModel>;
  userModel: ModelStatic<UserModel>;
  userFollowersModel: ModelStatic<UserFollowersModel>;
  userFollowingModel: ModelStatic<UserFollowingModel>;
  libraryPlaylists: ModelStatic<LibraryPlaylistsModel>;
  playlistAlbumsModel: ModelStatic<PlaylistAlbumsModel>;
  artistModel: ModelStatic<ArtistModel>;
  librarySinglesModel: ModelStatic<LibrarySinglesModel>;
}
