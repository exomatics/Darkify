import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class TrackModel extends Model<InferAttributes<TrackModel>, InferCreationAttributes<TrackModel>> {
  declare id: string;
  declare name: string;
  declare artists: string[];
  declare lyrics: string | null;
  declare play_count: number;
  declare deleted?: boolean;
  declare track_id: string;
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
      artists: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
      },
      lyrics: {
        type: DataTypes.TEXT,
      },
      play_count: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      track_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { trackModel, TrackModel };
