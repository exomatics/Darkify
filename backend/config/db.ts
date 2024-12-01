import { Sequelize } from 'sequelize';
import 'dotenv/config';
console.log(typeof process.env.POSTGRESDATABASE);
const POSTGRESDATABASE = `${process.env.POSTGRESDATABASE}`;
const POSTGRESUSER = `${process.env.POSTGRESUSER}`;
const POSTGRESPASSWORD = `${process.env.POSTGRESPASSWORD}`;

// import 'dotenv/config'
const sequelize = new Sequelize(
  POSTGRESDATABASE,
  POSTGRESUSER,
  POSTGRESPASSWORD,
  {
    host: 'localhost',
    dialect: 'postgres',
  },
  // 'postgres://postgres:99353@localhost:5432/darkify'
);
const db: any = {};
db.sequelize = sequelize;
db.playlistModel = require('../models/playlistModel.ts')(sequelize);
db.playlistTrackModel = require('../models/playlistTracksModel.ts')(sequelize);
db.trackModel = require('../models/trackModel.ts')(sequelize);
db.userModel = require('../models/userModel.ts')(sequelize);
db.userFollowersModel = require('../models/userFollowersModel.ts')(sequelize);
db.userFollowingModel = require('../models/userFollowingModel.ts')(sequelize);
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
};
sequelizeSync();
export default db;
