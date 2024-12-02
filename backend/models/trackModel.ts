import Sequelize, {Model, ModelStatic, Sequelize as sequelizeType} from 'sequelize';

export default (sequelize: sequelizeType) => {
  const trackModel:ModelStatic<Model> = sequelize.define(
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
