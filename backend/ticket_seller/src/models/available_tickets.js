'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AvailableTickets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.ticket, {
        targetKey: 'event_id',
        foreignKey: 'event_id',
        as: 'event',
      });
    }
  }
  AvailableTickets.init({
    event_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'tickets',
            key: 'event_id',
        },
    },
    amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
  }, {
    sequelize,
    timestamps: false,
    modelName: 'AvailableTickets',
  });
  return AvailableTickets;
};
