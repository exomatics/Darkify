import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistModel extends Model<
  InferAttributes<PlaylistModel>,
  InferCreationAttributes<PlaylistModel>
> {
  declare id: string;
  declare name: string;
  declare tracks_count?: number;
  declare description: string;
  declare cover_id: string;
  declare likes?: string;
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
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tracks_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(300),
      },
      cover_id: {
        type: DataTypes.UUID,
        unique: true,
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      owner: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
      },
      restrictions: {
        type: DataTypes.ENUM({ values: ['private', 'public', 'unlisted'] }),
        unique: true,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { playlistModel, PlaylistModel };
