import Sequelize from 'sequelize';

module.exports = (sequelize: any) => {
  const playlistTrackModel = sequelize.define(
    'playlist_track',
    {
      playlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      tracks_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
    },
    {
      createdAt: false,

      updatedAt: false,
    },
  );
  // playlistModel.belongsToMany(trackModel, {
  // 	through: playlistTrackModel,
  // 	foreignKey: 'playlist_id',
  // 	otherKey: 'track_id',
  // })
  // trackModel.belongsToMany(playlistModel, {
  // 	through: playlistTrackModel,
  // 	foreignKey: 'track_id',
  // 	otherKey: 'playlist_id',
  // })
  return playlistTrackModel;
};
