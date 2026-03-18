import type { ArtistModel } from '../models/artists.ts';
import type { LibraryPlaylistsModel } from '../models/library-playlists.ts';
import type { LibraryReleasesModel } from '../models/library-releases.ts';
import type { PlaylistAlbumsModel } from '../models/playlist-albums.ts';
import type { PlaylistFollowersModel } from '../models/playlist-followers.ts';
import type { PlaylistTrackModel } from '../models/playlist-tracks.ts';
import type { PlaylistModel } from '../models/playlist.ts';
import type { TrackArtistsModel } from '../models/track-artists.ts';
import type { TrackModel } from '../models/track.ts';
import type { UserFollowersModel } from '../models/user-followers.ts';
import type { UserFollowingModel } from '../models/user-following.ts';
import type { UserModel } from '../models/user.ts';
import type { ModelStatic, QueryInterface, Sequelize } from 'sequelize';

export interface Idb {
  sequelize: Sequelize;
  queryInterface: QueryInterface;
  playlistModel: ModelStatic<PlaylistModel>;
  trackModel: ModelStatic<TrackModel>;
  playlistTrackModel: ModelStatic<PlaylistTrackModel>;
  playlistFollowersModel: ModelStatic<PlaylistFollowersModel>;
  trackArtistsModel: ModelStatic<TrackArtistsModel>;
  userModel: ModelStatic<UserModel>;
  userFollowersModel: ModelStatic<UserFollowersModel>;
  userFollowingModel: ModelStatic<UserFollowingModel>;
  playlistAlbumsModel: ModelStatic<PlaylistAlbumsModel>;
  artistModel: ModelStatic<ArtistModel>;
  libraryReleasesModel: ModelStatic<LibraryReleasesModel>;
  libraryPlaylists: ModelStatic<LibraryPlaylistsModel>;
}
