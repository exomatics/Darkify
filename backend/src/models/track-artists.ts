import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class TrackArtistsModel extends Model<
  InferAttributes<TrackArtistsModel>,
  InferCreationAttributes<TrackArtistsModel>
> {
  declare artist_id: string;
  declare is_admin: boolean;
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
      is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
