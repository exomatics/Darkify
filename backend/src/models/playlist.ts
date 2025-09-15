import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';
import { Restrictions } from '../types/restrictions-type.ts';
import { Type } from '../types/playlist-type.ts';

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
      type: {
        type: DataTypes.ENUM({ values: ['general', 'liked'] }),
        unique: true,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { playlistModel, PlaylistModel };
