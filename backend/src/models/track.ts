import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class TrackModel extends Model<InferAttributes<TrackModel>, InferCreationAttributes<TrackModel>> {
  declare id: string;
  declare name: string;
  declare lyrics: string | null;
  declare play_count: number;
  declare deleted?: boolean;
  declare track_foldername: string;
  declare duration: string;
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
      lyrics: {
        type: DataTypes.TEXT,
      },
      play_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      track_foldername: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
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
