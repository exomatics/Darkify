import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistTrackModel extends Model<
  InferAttributes<PlaylistTrackModel>,
  InferCreationAttributes<PlaylistTrackModel>
> {
  declare playlist_id: string;
  declare track_id: string;
  declare order?: number;
  declare date_added?: Date;
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
      track_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      order: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
      },
      date_added: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { PlaylistTrackModel, playlistTrackModel };
