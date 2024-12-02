import Sequelize from 'sequelize';

export default (sequelize: any) => {
  const userFollowingModel = sequelize.define(
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
