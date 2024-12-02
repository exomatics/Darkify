import Sequelize, { Model, ModelStatic, Sequelize as sequelizeType } from 'sequelize';

export default (sequelize: sequelizeType) => {
  const userFollowersModel: ModelStatic<Model> = sequelize.define(
    'user_follower',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        unique: 'compositeIndex',
      },
      followers_id: {
        type: Sequelize.UUID,
        unique: 'compositeIndex',
      },
    },
    {
      createdAt: false,

      updatedAt: false,
    },
  );

  return userFollowersModel;
};
