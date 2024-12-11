import { Sequelize } from 'sequelize';

import playlistModel from '../models/playlist-model.ts';
import playlistTrackModel from '../models/playlist-tracks-model.ts';
import trackModel from '../models/track-model.ts';
import userFollowersModel from '../models/user-followers-model.ts';
import userFollowingModel from '../models/user-following-model.ts';
import userModel from '../models/user-model.ts';

import logger from './logger.ts';

import type { Idb } from '../interfaces/database-interface.ts';

const POSTGRESDATABASE = process.env.POSTGRESDATABASE;
const POSTGRESUSER = process.env.POSTGRESUSER;
const POSTGRESPASSWORD = process.env.POSTGRESPASSWORD;
const POSTGRESPORT = process.env.POSTGRESPORT;

if (!POSTGRESUSER || !POSTGRESDATABASE || !POSTGRESPASSWORD || !POSTGRESPORT) {
  throw new Error('Environment variables are empty. Configure .env file according to .env.example');
}

const sequelize: Sequelize = new Sequelize(POSTGRESDATABASE, POSTGRESUSER, POSTGRESPASSWORD, {
  host: 'localhost',
  port: +POSTGRESPORT,
  dialect: 'postgres',
  logging: false,
});
const database: Idb = {
  sequelize,
  playlistModel: playlistModel(sequelize),
  playlistTrackModel: playlistTrackModel(sequelize),
  trackModel: trackModel(sequelize),
  userModel: userModel(sequelize),
  userFollowersModel: userFollowersModel(sequelize),
  userFollowingModel: userFollowingModel(sequelize),
};

database.playlistModel.belongsToMany(database.trackModel, {
  through: database.playlistTrackModel,
  foreignKey: 'playlist_id',
  otherKey: 'track_id',
});
database.trackModel.belongsToMany(database.playlistModel, {
  through: database.playlistTrackModel,
  foreignKey: 'track_id',
  otherKey: 'playlist_id',
});
database.userModel.hasOne(database.userFollowersModel, { foreignKey: 'id' });
database.userFollowersModel.belongsTo(database.userModel, { foreignKey: 'id' });

// Связь между User и UsersFollowing
database.userModel.hasOne(database.userFollowingModel, { foreignKey: 'id' });
database.userFollowingModel.belongsTo(database.userModel, { foreignKey: 'id' });

// Связь между User и Playlist
database.userModel.hasMany(database.playlistModel, { foreignKey: 'owner' });
database.playlistModel.belongsTo(database.userModel, { foreignKey: 'owner' });

// Связь между User и Track
database.userModel.hasMany(database.trackModel, { foreignKey: 'artist' });
database.trackModel.belongsTo(database.userModel, { foreignKey: 'artist' });

const sequelizeSync = async (sequelizeConfig: Sequelize) => {
  await sequelizeConfig.sync();
  logger.info('database sync!');
};
sequelizeSync(sequelize);
export default database;
