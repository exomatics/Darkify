import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class UserFollowingModel extends Model<
  InferAttributes<UserFollowingModel>,
  InferCreationAttributes<UserFollowingModel>
> {
  declare user_id: string;
  declare following_id: string | null;
}

const userFollowingModel = (sequelize: Sequelize) => {
  return sequelize.define<UserFollowingModel>(
    'user_following',
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        // unique: 'compositeIndex',
      },
      following_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        // unique: 'compositeIndex',
      },
    },
    {
      timestamps: false,
    },
  );
};

export { userFollowingModel, UserFollowingModel };
