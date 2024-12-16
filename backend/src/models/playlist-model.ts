import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistModel extends Model<
  InferAttributes<PlaylistModel>,
  InferCreationAttributes<PlaylistModel>
> {
  declare id: string;
  declare track: string;
  declare name: string;
  declare description: string;
  declare cover_url: string;
  declare owner: string;
  declare restrictions: string;
}
const playlistModel = (sequelize: Sequelize) => {
  return sequelize.define<PlaylistModel>(
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
};

export { playlistModel, PlaylistModel };
