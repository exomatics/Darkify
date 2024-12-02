import Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const userModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      is_artist: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
      },
      avatar_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      followers_id: {
        type: DataTypes.UUID,
        unique: true,
      },
      following: {
        type: DataTypes.UUID,
        unique: true,
      },
      playlist: {
        type: DataTypes.UUID,
        unique: true,
      },
    },
    {
      timestamps: false,
    },
  );

  return userModel;
};
