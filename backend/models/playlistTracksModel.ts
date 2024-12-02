import Sequelize from 'sequelize';

export default (sequelize: any) => {
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

  return playlistTrackModel;
};
