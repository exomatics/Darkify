import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class PlaylistFollowersModel extends Model<
  InferAttributes<PlaylistFollowersModel>,
  InferCreationAttributes<PlaylistFollowersModel>
> {
  declare playlist_id: string;
  declare user_id: string;
}
const playlistFollowersModel = (sequelize: Sequelize) => {
  return sequelize.define<PlaylistFollowersModel>(
    'playlist_followers',
    {
      playlist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        // unique: 'compositeIndex',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        // unique: 'compositeIndex',
      },
    },
    {
      timestamps: false,
    },
  );
};

export { playlistFollowersModel, PlaylistFollowersModel };
