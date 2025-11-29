import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class LibraryPlaylistsModel extends Model<
  InferAttributes<LibraryPlaylistsModel>,
  InferCreationAttributes<LibraryPlaylistsModel>
> {
  declare playlist_id: string;
  declare user_id: string;
  declare date_added?: string;
  declare date_played?: string;
  declare order: number;
}
const libraryPlaylists = (sequelize: Sequelize) => {
  return sequelize.define<LibraryPlaylistsModel>(
    'library_playlists',
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
      date_played: {
        type: DataTypes.DATE,
      },
      order: {
        type: DataTypes.INTEGER,
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

export { libraryPlaylists, LibraryPlaylistsModel };
