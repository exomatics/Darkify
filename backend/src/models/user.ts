import { DataTypes, Model } from 'sequelize';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: string;
  declare is_artist: boolean;
  declare hash: string;
  declare salt: string;
  declare visible_username: string;
  declare username: string;
  declare email: string;
  declare avatar_id: string;
}

const userModel = (sequelize: Sequelize) => {
  return sequelize.define<UserModel>(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      is_artist: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      visible_username: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
      },
      avatar_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: false,
    },
  );
};

export { userModel, UserModel };
