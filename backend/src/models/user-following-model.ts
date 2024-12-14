import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class UserFollowingModel extends Model<
  InferAttributes<UserFollowingModel>,
  InferCreationAttributes<UserFollowingModel>
> {
  declare id: string;
  declare following_id: string | null;
}

const userFollowingModel = (sequelize: Sequelize) => {
  return sequelize.define<UserFollowingModel>(
    'user_following',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        unique: 'compositeIndex',
      },
      following_id: {
        type: DataTypes.UUID,
        unique: 'compositeIndex',
      },
    },
    {
      timestamps: false,
    },
  );
};

export { userFollowingModel, UserFollowingModel };
