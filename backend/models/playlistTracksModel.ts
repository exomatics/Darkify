import Sequelize from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const playlistTrackModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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

  return playlistTrackModel;
};
