import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const POSTGRESDATABASE = `${process.env.POSTGRESDATABASE}`;
const POSTGRESUSER = `${process.env.POSTGRESUSER}`;
const POSTGRESPASSWORD = `${process.env.POSTGRESPASSWORD}`;

const sequelize = new Sequelize(
  POSTGRESDATABASE,
  POSTGRESUSER,
  POSTGRESPASSWORD,
  {
    host: 'localhost',
    dialect: 'postgres',
  },
);
import playlistModel from '../models/playlistModel.ts';
import playlistTrackModel from '../models/playlistTracksModel.ts';
import trackModel from '../models/trackModel.ts';
import userModel from '../models/userModel.ts';
import userFollowersModel from '../models/userFollowersModel.ts';
import userFollowingModel from '../models/userFollowingModel.ts';
const db: any = {};
db.sequelize = sequelize;
db.playlistModel = playlistModel(sequelize);
db.playlistTrackModel = playlistTrackModel(sequelize);
db.trackModel = trackModel(sequelize);
db.userModel = userModel(sequelize);
db.userFollowersModel = userFollowersModel(sequelize);
db.userFollowingModel = userFollowingModel(sequelize);
db.playlistModel.belongsToMany(db.trackModel, {
  through: db.playlistTrackModel,
  foreignKey: 'playlist_id',
  otherKey: 'track_id',
});
db.trackModel.belongsToMany(db.playlistModel, {
  through: db.playlistTrackModel,
  foreignKey: 'track_id',
  otherKey: 'playlist_id',
});
db.userModel.hasOne(db.userFollowersModel, { foreignKey: 'id' });
db.userFollowersModel.belongsTo(db.userModel, { foreignKey: 'id' });

// Связь между User и UsersFollowing
db.userModel.hasOne(db.userFollowingModel, { foreignKey: 'id' });
db.userFollowingModel.belongsTo(db.userModel, { foreignKey: 'id' });

// Связь между User и Playlist
db.userModel.hasMany(db.playlistModel, { foreignKey: 'owner' });
db.playlistModel.belongsTo(db.userModel, { foreignKey: 'owner' });

// Связь между User и Track
db.userModel.hasMany(db.trackModel, { foreignKey: 'artist' });
db.trackModel.belongsTo(db.userModel, { foreignKey: 'artist' });
// playlistModel(sequelize, )
// playlistTrackModel(sequelize, )
// trackModel(sequelize, )
// userModel(sequelize, )
// userFollowersModel(sequelize, )
// userFollowingModel(sequelize, )
const sequelizeSync = async () => {
  await sequelize.sync();
}
sequelizeSync();
export default db;
