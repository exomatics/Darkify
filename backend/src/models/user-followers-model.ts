import { DataTypes } from 'sequelize';

import type { Sequelize, Model, ModelStatic } from 'sequelize';

const sequelizeModel = (sequelize: Sequelize) => {
  const userFollowersModel: ModelStatic<Model> = sequelize.define(
    'user_follower',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: 'compositeIndex',
      },
      followers_id: {
        type: DataTypes.UUID,
        unique: 'compositeIndex',
      },
    },
    {
      timestamps: false,
    },
  );

  return userFollowersModel;
};

export default sequelizeModel;
