import { DataTypes } from 'sequelize';

import type { Sequelize, Model, ModelStatic } from 'sequelize';

const sequelizeModel = (sequelize: Sequelize) => {
  const userFollowingModel: ModelStatic<Model> = sequelize.define(
    'user_following',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: 'compositeIndex',
      },
      following_id: {
        type: DataTypes.UUID,
        unique: 'compositeIndex',
      },
    },
    {
      timestamps: false,
    },
  );

  return userFollowingModel;
};

export default sequelizeModel;
