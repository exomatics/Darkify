import Sequelize, { DataTypes } from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const userFollowingModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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
