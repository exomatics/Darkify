import { Sequelize, Op } from 'sequelize';

import { artistModel } from '../models/artists.ts';
import { assignRelations } from '../models/database-relations.ts';
import { libraryPlaylists } from '../models/library-playlists.ts';
import { libraryReleasesModel } from '../models/library-releases.ts';
import { playlistAlbumsModel } from '../models/playlist-albums.ts';
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
  define: {
    underscored: true,
  },
});
const database: Idb = {
  sequelize,
  queryInterface: sequelize.getQueryInterface(),
  playlistModel: playlistModel(sequelize),
  trackModel: trackModel(sequelize),
  playlistFollowersModel: playlistFollowersModel(sequelize),
  playlistTrackModel: playlistTrackModel(sequelize),
  trackArtistsModel: trackArtistsModel(sequelize),
  userModel: userModel(sequelize),
  userFollowersModel: userFollowersModel(sequelize),
  userFollowingModel: userFollowingModel(sequelize),
  playlistAlbumsModel: playlistAlbumsModel(sequelize),
  artistModel: artistModel(sequelize),
  libraryReleasesModel: libraryReleasesModel(sequelize),
  libraryPlaylists: libraryPlaylists(sequelize),
};

database.playlistTrackModel.belongsTo(database.trackModel, {
  foreignKey: 'track_id',
});
database.trackModel.hasMany(database.playlistTrackModel, {
  foreignKey: 'track_id',
});

database.playlistModel.addScope('albumOnly', {
  where: { type: 'album' },
});
database.trackModel.belongsTo(database.playlistModel.scope('albumOnly'), {
  as: 'album',
  foreignKey: 'album_id',
  targetKey: 'id',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

database.playlistTrackModel.belongsTo(database.playlistModel, {
  // targetKey: 'playlist_id',
  foreignKey: 'playlist_id',
  constraints: false,
});
database.playlistModel.hasMany(database.playlistTrackModel, {
  // sourceKey: 'id',
  foreignKey: 'playlist_id',
  constraints: false,
});

// database.userFollowersModel.belongsTo(database.userModel, {
//   foreignKey: 'id',
// });
// database.userModel.hasMany(database.userFollowersModel, {
//   foreignKey: 'followers_id',
// });

database.userFollowingModel.belongsTo(database.userModel, {
  foreignKey: 'following_id',
  constraints: false,
});
database.userModel.hasMany(database.userFollowingModel, {
  foreignKey: 'following_id',
  constraints: false,
});

database.userModel.hasMany(database.playlistModel, { foreignKey: 'owner', constraints: false });
database.playlistModel.belongsTo(database.userModel, { foreignKey: 'owner', constraints: false });

database.userModel.belongsToMany(database.trackModel, {
  foreignKey: 'artist_id',
  through: database.trackArtistsModel,
  otherKey: 'track_id',
  constraints: false,
});
database.trackModel.belongsToMany(database.userModel, {
  foreignKey: 'track_id',
  through: database.trackArtistsModel,
  otherKey: 'artist_id',
  constraints: false,
});

database.playlistModel.belongsToMany(database.trackModel, {
  through: { model: database.playlistTrackModel, unique: false },
  foreignKey: 'playlist_id',
  otherKey: 'track_id',
  constraints: false,
});
database.trackModel.belongsToMany(database.playlistModel, {
  through: { model: database.playlistTrackModel, unique: false },
  foreignKey: 'track_id',
  otherKey: 'playlist_id',
  constraints: false,
});

database.playlistFollowersModel.belongsTo(database.playlistModel, {
  foreignKey: 'playlist_id',
  constraints: false,
});
database.playlistModel.hasMany(database.playlistFollowersModel, {
  foreignKey: 'playlist_id',
  constraints: false,
});

database.playlistFollowersModel.belongsTo(database.userModel, {
  foreignKey: 'user_id',
  constraints: false,
});
database.userModel.hasMany(database.playlistFollowersModel, {
  foreignKey: 'user_id',
  constraints: false,
});

database.libraryReleasesModel.belongsTo(database.playlistModel.scope('albumOnly'), {
  foreignKey: 'album_id',
  onDelete: 'CASCADE',
});
database.playlistModel.scope('albumOnly').hasMany(database.libraryReleasesModel, {
  foreignKey: 'album_id',
  onDelete: 'CASCADE',
});
// database.playlistModel
//   .scope('albumOnly')
//   .belongsTo(database.libraryReleasesModel, { foreignKey: 'album_id' });

database.libraryReleasesModel.belongsTo(database.userModel, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
database.userModel.hasMany(database.libraryReleasesModel, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

database.trackModel.hasMany(database.libraryReleasesModel, {
  foreignKey: 'track_id',
  onDelete: 'CASCADE',
});
database.libraryReleasesModel.belongsTo(database.trackModel, {
  foreignKey: 'track_id',
  onDelete: 'CASCADE',
});

database.playlistModel.addScope('notAlbum', {
  where: { type: { [Op.not]: 'album' } },
});

database.libraryPlaylists.belongsTo(database.playlistModel.scope('notAlbum'), {
  foreignKey: 'playlist_id',
  onDelete: 'CASCADE',
});

database.playlistModel
  .scope('notAlbum')
  .hasMany(database.libraryPlaylists, { foreignKey: 'playlist_id', onDelete: 'CASCADE' });

database.libraryPlaylists.belongsTo(database.userModel, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});
database.userModel.hasMany(database.libraryPlaylists, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

database.playlistAlbumsModel.belongsTo(database.playlistModel, {
  foreignKey: 'playlist_id',
  constraints: false,
});
database.playlistModel.hasOne(database.playlistAlbumsModel, {
  foreignKey: 'playlist_id',
  constraints: false,
});

database.userModel.hasOne(database.artistModel, { foreignKey: 'user_id' });
database.artistModel.belongsTo(database.userModel, { foreignKey: 'user_id' });

const sequelizeSync = async (sequelizeConfig: Sequelize, force = false) => {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (force) {
    await sequelizeConfig.sync({ force: true });
    logger.info('database sync!');
    await assignRelations(database);
    logger.info('database relation set!');
  } else {
    await sequelizeConfig.sync();
    logger.info('database sync!');
  }
};
void sequelizeSync(sequelize);
export default database;
