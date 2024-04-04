'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.ticket, {
        foreignKey: 'event_id',
        targetKey: 'event_id',
        as: 'event',
      });
    }
  }
  Request.init({
    request_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.STRING,
      references: {
        model: 'tickets',
        key: 'event_id'
      }
    } ,
    deposit_token: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    seller: DataTypes.INTEGER,
    valid: DataTypes.BOOLEAN,
    pdf: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Request',
  });
  return Request;
};
