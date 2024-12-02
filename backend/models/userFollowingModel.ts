import Sequelize from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const userFollowingModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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
