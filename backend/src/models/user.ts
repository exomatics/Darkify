import { DataTypes, Model } from 'sequelize';

import { Bitrate } from '../types/bitrate-type.ts';

import type { InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';

class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: string;
  declare is_artist: boolean;
  declare hash: string;
  declare salt: string;
  declare visible_username: string;
  declare username: string;
  declare email: string;
  declare avatar_url: string | null;
  declare bitrate?: Bitrate;
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
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
      },
      avatar_url: {
        type: DataTypes.UUID,
      },
      bitrate: {
        type: DataTypes.ENUM(...Object.values(Bitrate)),
        defaultValue: 'high',
      },
    },
    {
      timestamps: false,
      indexes: [
        {
          name: 'users_username_unique',
          unique: true,
          fields: ['username'],
        },
        {
          name: 'users_email_unique',
          unique: true,
          fields: ['email'],
        },
        {
          name: 'users_avatar_unique',
          unique: true,
          fields: ['avatar_url'],
        },
      ],
    },
  );
};

export { userModel, UserModel };
