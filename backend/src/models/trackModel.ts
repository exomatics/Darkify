import Sequelize, { DataTypes } from 'sequelize';

export default (sequelize: Sequelize.Sequelize) => {
  const trackModel: Sequelize.ModelStatic<Sequelize.Model> = sequelize.define(
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

  return trackModel;
};
