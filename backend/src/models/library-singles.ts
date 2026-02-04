import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class LibrarySinglesModel extends Model<
  InferAttributes<LibrarySinglesModel>,
  InferCreationAttributes<LibrarySinglesModel>
> {
  declare track_id: string;
  declare user_id: string;
  declare date_added: string;
  declare date_played: string | null;
  declare order: number;
}
const librarySingles = (sequelize: Sequelize) => {
  return sequelize.define<LibrarySinglesModel>(
    'library_singles',
    {
      track_id: {
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

export { librarySingles, LibrarySinglesModel };
