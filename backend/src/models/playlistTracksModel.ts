import Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const playlistTrackModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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
