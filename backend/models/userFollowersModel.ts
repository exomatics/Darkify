import Sequelize from 'sequelize';

module.exports = (sequelize: any) => {
  const userFollowersModel = sequelize.define(
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
