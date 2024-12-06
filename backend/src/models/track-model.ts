import { DataTypes } from 'sequelize';

import type { Sequelize, Model, ModelStatic } from 'sequelize';

const sequelizeModel = (sequelize: Sequelize) => {
  const trackModel: ModelStatic<Model> = sequelize.define(
    'track',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      artist: {
        type: DataTypes.UUID,
      },
      lyrics: {
        type: DataTypes.TEXT,
      },
      number_of_play: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );

  return trackModel;
};

export default sequelizeModel;
