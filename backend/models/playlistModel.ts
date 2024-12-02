import Sequelize, {Model, ModelStatic, Sequelize as sequelizeType} from 'sequelize';

export default (sequelize: sequelizeType) => {
  const playlistModel:ModelStatic<Model> = sequelize.define(
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
