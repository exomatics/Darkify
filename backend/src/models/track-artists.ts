import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class TrackArtistsModel extends Model<
  InferAttributes<TrackArtistsModel>,
  InferCreationAttributes<TrackArtistsModel>
> {
  declare artist_id: string;
  declare track_id: string;
}
const trackArtistsModel = (sequelize: Sequelize) => {
  return sequelize.define<TrackArtistsModel>(
    'track_artists',
    {
      artist_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      track_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { trackArtistsModel, TrackArtistsModel };
