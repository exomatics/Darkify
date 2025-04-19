import type { PlaylistFollowersModel } from '../models/playlist-followers.ts';
import type { PlaylistTrackModel } from '../models/playlist-tracks.ts';
import type { PlaylistModel } from '../models/playlist.ts';
import type { TrackModel } from '../models/track.ts';
import type { UserFollowersModel } from '../models/user-followers.ts';
import type { UserModel } from '../models/user.ts';
import type { Model, ModelStatic, Sequelize } from 'sequelize';

export interface Idb {
  sequelize: Sequelize;
  playlistModel: ModelStatic<PlaylistModel>;
  playlistTrackModel: ModelStatic<PlaylistTrackModel>;
  playlistFollowersModel: ModelStatic<PlaylistFollowersModel>;
  trackModel: ModelStatic<TrackModel>;
  userModel: ModelStatic<UserModel>;
  userFollowersModel: ModelStatic<UserFollowersModel>;
  userFollowingModel: ModelStatic<Model>;
}
