import { Sequelize } from 'sequelize';

import { playlistFollowersModel } from '../models/playlist-followers.ts';
import { playlistTrackModel } from '../models/playlist-tracks.ts';
import { playlistModel } from '../models/playlist.ts';
import { trackArtistsModel } from '../models/track-artists.ts';
import { trackModel } from '../models/track.ts';
import { userFollowersModel } from '../models/user-followers.ts';
import { userFollowingModel } from '../models/user-following.ts';
import { userModel } from '../models/user.ts';

import logger from './logger.ts';

import type { Idb } from '../interfaces/database-interface.ts';

const POSTGRESHOST = process.env.POSTGRESHOST ?? 'localhost';
const POSTGRESDATABASE = process.env.POSTGRESDATABASE;
const POSTGRESUSER = process.env.POSTGRESUSER;
const POSTGRESPASSWORD = process.env.POSTGRESPASSWORD;
const POSTGRESPORT = process.env.POSTGRESPORT;

if (!POSTGRESUSER || !POSTGRESDATABASE || !POSTGRESPASSWORD || !POSTGRESPORT || !POSTGRESPORT) {
  throw new Error('Environment variables are empty. Configure .env file according to .env.example');
}

const sequelize: Sequelize = new Sequelize(POSTGRESDATABASE, POSTGRESUSER, POSTGRESPASSWORD, {
  host: POSTGRESHOST,
  port: +POSTGRESPORT,
  dialect: 'postgres',
  logging: false,
});
const database: Idb = {
  sequelize,
  playlistModel: playlistModel(sequelize),
  playlistFollowersModel: playlistFollowersModel(sequelize),
  playlistTrackModel: playlistTrackModel(sequelize),
  trackModel: trackModel(sequelize),
  trackArtistsModel: trackArtistsModel(sequelize),
  userModel: userModel(sequelize),
  userFollowersModel: userFollowersModel(sequelize),
  userFollowingModel: userFollowingModel(sequelize),
};

database.playlistModel.belongsToMany(database.trackModel, {
  through: database.playlistTrackModel,
  foreignKey: 'playlist_id',
  otherKey: 'track_filename',
});
database.trackModel.belongsToMany(database.playlistModel, {
  through: database.playlistTrackModel,
  foreignKey: 'tracks_id',
  otherKey: 'playlist_id',
});
database.userModel.hasMany(database.userFollowersModel, { foreignKey: 'user_id' });
database.userFollowersModel.belongsTo(database.userModel, { foreignKey: 'user_id' });

// Связь между User и UsersFollowing
database.userModel.hasMany(database.userFollowingModel, { foreignKey: 'user_id' });
database.userFollowingModel.belongsTo(database.userModel, { foreignKey: 'user_id' });

// Связь между User и Playlist
database.userModel.hasMany(database.playlistModel, { foreignKey: 'owner' });
database.playlistModel.belongsTo(database.userModel, { foreignKey: 'owner' });

// Связь между User и Track
database.userModel.belongsToMany(database.trackModel, {
  foreignKey: 'artist_id',
  through: database.trackArtistsModel,
  otherKey: 'track_id',
});
database.trackModel.belongsToMany(database.userModel, {
  foreignKey: 'track_id',
  through: database.trackArtistsModel,
  otherKey: 'artist_id',
});
// Связь между Playlist и PlaylistFollowers
database.playlistModel.hasMany(database.playlistFollowersModel, { foreignKey: 'playlist_id' });
database.playlistFollowersModel.belongsTo(database.playlistModel, { foreignKey: 'playlist_id' });

const sequelizeSync = async (sequelizeConfig: Sequelize) => {
  await sequelizeConfig.sync();
  logger.info('database sync!');
};
void sequelizeSync(sequelize);
export default database;
