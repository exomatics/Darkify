import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class TrackModel extends Model<InferAttributes<TrackModel>, InferCreationAttributes<TrackModel>> {
  declare id: string;
  declare name: string;
  declare artist: string;
  declare lyrics: string | null;
  declare number_of_play: number;
}
const trackModel = (sequelize: Sequelize) => {
  return sequelize.define<TrackModel>(
    'track',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      artist: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      lyrics: {
        type: DataTypes.TEXT,
      },
      number_of_play: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { trackModel, TrackModel };
