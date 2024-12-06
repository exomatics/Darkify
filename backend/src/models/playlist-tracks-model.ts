import { DataTypes } from 'sequelize';

import type { Sequelize, Model, ModelStatic } from 'sequelize';

const sequelizeModel = (sequelize: Sequelize) => {
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

export default sequelizeModel;
