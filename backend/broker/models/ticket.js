'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.AvailableTickets, {
        sourceKey: 'event_id',
        foreignKey: 'event_id',
        as: 'availableTickets',
      });

      this.hasMany(models.Auction, {
        sourceKey: 'event_id',
        foreignKey: 'event_id',
        as: 'auctions',
      });
    }
  }
  ticket.init({
    name: DataTypes.STRING,
    date: DataTypes.STRING,
    price: DataTypes.FLOAT,
    quantity: DataTypes.FLOAT,
    location: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    event_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'ticket',
  });
  return ticket;
};
