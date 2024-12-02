import Sequelize from 'sequelize';
export default (sequelize: any) => {
  const playlistModel = sequelize.define(
    'playlist',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      track: {
        type: Sequelize.UUID,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(300),
      },
      cover_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      owner: {
        type: Sequelize.UUID,
        unique: true,
      },
      restrictions: {
        type: Sequelize.UUID,
        unique: true,
      },
    },
    {
      createdAt: false,

      updatedAt: false,
    },
  );

  return playlistModel;
};
