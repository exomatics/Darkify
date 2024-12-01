const Sequelize = require('sequelize');
module.exports = (sequelize: any) => {
  const trackModel = sequelize.define(
    'track',
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      artist: {
        type: Sequelize.UUID,
      },
      lyrics: {
        type: Sequelize.TEXT,
      },
      number_of_play: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    },
    {
      createdAt: false,

      updatedAt: false,
    },
  );
  return trackModel;
};
