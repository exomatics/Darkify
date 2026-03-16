import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistAlbumsModel extends Model<
  InferAttributes<PlaylistAlbumsModel>,
  InferCreationAttributes<PlaylistAlbumsModel>
> {
  declare playlist_id: string;
  declare date_released?: Date | null;
}
const playlistAlbumsModel = (sequelize: Sequelize) => {
  return sequelize.define<PlaylistAlbumsModel>(
    'playlist_albums',
    {
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      date_released: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          name: 'playlist_albums_playlist_id_unique',
          unique: true,
          fields: ['playlist_id'],
        },
      ],
    },
  );
};

export { playlistAlbumsModel, PlaylistAlbumsModel };
