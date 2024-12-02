import Sequelize from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const userFollowersModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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
