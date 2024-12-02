import Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const userFollowersModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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
