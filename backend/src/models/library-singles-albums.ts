import { DataTypes, Model } from 'sequelize';

import { errorMessages } from '../errors/error-messages.ts';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class LibrarySinglesAlbumsModel extends Model<
  InferAttributes<LibrarySinglesAlbumsModel>,
  InferCreationAttributes<LibrarySinglesAlbumsModel>
> {
  declare id: string;
  declare track_id?: string;
  declare album_id?: string;
  declare user_id: string;
  declare date_added?: string;
  declare date_played: string | null;
  declare order: number;
}
const librarySinglesAlbumsModel = (sequelize: Sequelize) => {
  return sequelize.define<LibrarySinglesAlbumsModel>(
    'library_singles',
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

export { librarySinglesAlbumsModel, LibrarySinglesAlbumsModel };
