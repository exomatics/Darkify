import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class ArtistModel extends Model<
  InferAttributes<ArtistModel>,
  InferCreationAttributes<ArtistModel>
> {
  declare user_id: string;
  declare description: string | null;
  declare banner_id: string | null;
}

const artistModel = (sequelize: Sequelize) => {
  return sequelize.define<ArtistModel>(
    'artist',
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING(1690),
      },
      banner_id: {
        type: DataTypes.UUID,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { artistModel, ArtistModel };
