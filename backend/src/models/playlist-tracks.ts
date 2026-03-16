import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistTrackModel extends Model<
  InferAttributes<PlaylistTrackModel>,
  InferCreationAttributes<PlaylistTrackModel>
> {
  declare playlist_id: string;
  declare track_id: string;
  declare order: number;
  declare date_added?: Date;
  declare id: string;
}
const playlistTrackModel = (sequelize: Sequelize) => {
  return sequelize.define<PlaylistTrackModel>(
    'playlist_track',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'playlists',
          key: 'id',
        },
      },
      track_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'tracks',
          key: 'id',
        },
      },
      order: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      date_added: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
    },
  );
};
export { PlaylistTrackModel, playlistTrackModel };
