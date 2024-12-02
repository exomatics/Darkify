import Sequelize, { Model, ModelStatic, Sequelize as sequelizeType } from 'sequelize';

export default (sequelize: sequelizeType) => {
  const userFollowingModel: ModelStatic<Model> = sequelize.define(
    'user_following',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        unique: 'compositeIndex',
      },
      following_id: {
        type: Sequelize.UUID,
        unique: 'compositeIndex',
      },
    },
    {
      createdAt: false,

      updatedAt: false,
    },
  );

  return userFollowingModel;
};
