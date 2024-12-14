import type { PlaylistModel } from '../models/playlist-model.ts';
import type { PlaylistTrackModel } from '../models/playlist-tracks-model.ts';
import type { TrackModel } from '../models/track-model.ts';
import type { UserFollowersModel } from '../models/user-followers-model.ts';
import type { UserModel } from '../models/user-model.ts';
import type { Model, ModelStatic, Sequelize } from 'sequelize';

export interface Idb {
  sequelize: Sequelize;
  playlistModel: ModelStatic<PlaylistModel>;
  playlistTrackModel: ModelStatic<PlaylistTrackModel>;
  trackModel: ModelStatic<TrackModel>;
  userModel: ModelStatic<UserModel>;
  userFollowersModel: ModelStatic<UserFollowersModel>;
  userFollowingModel: ModelStatic<Model>;
}
