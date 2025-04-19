import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistTrackModel extends Model<
  InferAttributes<PlaylistTrackModel>,
  InferCreationAttributes<PlaylistTrackModel>
> {
  declare playlist_id: string;
  declare tracks_id: string;
}
const playlistTrackModel = (sequelize: Sequelize) => {
  return sequelize.define<PlaylistTrackModel>(
    'playlist_track',
    {
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      tracks_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { PlaylistTrackModel, playlistTrackModel };
