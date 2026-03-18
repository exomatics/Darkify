import { DataTypes, Model } from 'sequelize';

import type { Restrictions, Type } from '../interfaces/playlist-interface.ts';
import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistModel extends Model<
  InferAttributes<PlaylistModel>,
  InferCreationAttributes<PlaylistModel>
> {
  declare id: string;
  declare name: string;
  declare tracks_count?: number;
  declare description: string | null;
  declare cover_id: string | null;
  declare likes?: string;
  declare owner: string;
  declare restrictions: Restrictions;
  declare type: Type;
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
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      owner: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      restrictions: {
        type: DataTypes.ENUM({ values: ['private', 'public', 'unlisted'] }),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM({ values: ['general', 'liked', 'album'] }),
        allowNull: false,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          name: 'playlists_cover_id_unique',
          unique: true,
          fields: ['cover_id'],
        },
      ],
    },
  );
};

export { playlistModel, PlaylistModel };
