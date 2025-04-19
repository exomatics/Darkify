import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';
class UserFollowersModel extends Model<
  InferAttributes<UserFollowersModel>,
  InferCreationAttributes<UserFollowersModel>
> {
  declare user_id: string;
  declare followers_id: string | null;
}
const userFollowersModel = (sequelize: Sequelize) => {
  return sequelize.define<UserFollowersModel>(
    'user_followers',
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        // unique: 'compositeIndex',
      },
      followers_id: {
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

export { userFollowersModel, UserFollowersModel };
