import { DataTypes } from 'sequelize';

import type { Sequelize, Model, ModelStatic } from 'sequelize';

const sequelizeModel = (sequelize: Sequelize) => {
  const userModel: ModelStatic<Model> = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      is_artist: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
      },
      avatar_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      followers_id: {
        type: DataTypes.UUID,
        unique: true,
      },
      following_id: {
        type: DataTypes.UUID,
        unique: true,
      },
      playlist: {
        type: DataTypes.UUID,
        unique: true,
      },
    },
    {
      timestamps: false,
    },
  );

  return userModel;
};

export default sequelizeModel;
