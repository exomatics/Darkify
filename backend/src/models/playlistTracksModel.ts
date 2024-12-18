import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

export default (sequelize: Sequelize) => {
  const playlistTrackModel: ModelStatic<Model> = sequelize.define(
    'playlist_track',
    {
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      tracks_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
    },
  );

  return playlistTrackModel;
};
