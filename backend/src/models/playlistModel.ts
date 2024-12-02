import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';
export default (sequelize: Sequelize) => {
  const playlistModel: ModelStatic<Model> = sequelize.define(
    'playlist',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      track: {
        type: DataTypes.UUID,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(300),
      },
      cover_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      owner: {
        type: DataTypes.UUID,
        unique: true,
      },
      restrictions: {
        type: DataTypes.UUID,
        unique: true,
      },
    },
    {
      timestamps: false,
    },
  );

  return playlistModel;
};
