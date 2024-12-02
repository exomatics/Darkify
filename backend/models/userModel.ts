import Sequelize from 'sequelize';

export default (sequelize: any) => {
  const userModel = sequelize.define(
    'user',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      is_artist: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(25),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
      },
      avatar_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      followers_id: {
        type: Sequelize.UUID,
        unique: true,
      },
      following: {
        type: Sequelize.UUID,
        unique: true,
      },
      playlist: {
        type: Sequelize.UUID,
        unique: true,
      },
    },
    {
      createdAt: false,

      updatedAt: false,
    },
  );

  return userModel;
};
