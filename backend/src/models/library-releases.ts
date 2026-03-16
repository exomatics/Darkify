import { DataTypes, Model } from 'sequelize';

import { errorMessages } from '../errors/error-messages.ts';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class LibraryReleasesModel extends Model<
  InferAttributes<LibraryReleasesModel>,
  InferCreationAttributes<LibraryReleasesModel>
> {
  declare id: string;
  declare track_id?: string | null;
  declare album_id?: string | null;
  declare user_id: string;
  declare date_added?: string;
  declare date_played: string | null;
  declare order: number;
}
const libraryReleasesModel = (sequelize: Sequelize) => {
  return sequelize.define<LibraryReleasesModel>(
    'library_releases',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      track_id: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: 'compositeIndex',
      },
      album_id: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: 'compositeIndex',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: 'compositeIndex',
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
      validate: {
        isBothOrNone() {
          if (this.playlist_id !== this.track_id) {
            throw new Error(errorMessages.database.BothOrNone);
          }
        },
      },
    },
  );
};

export { libraryReleasesModel, LibraryReleasesModel };
