'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Auction extends Model {
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

      this.hasMany(models.Auction, {
        sourceKey: 'auction_id',
        foreignKey: 'auction_id',
        as: 'proposals',
      });
    }
  }
  Auction.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    auction_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    proposal_id: {
        type: DataTypes.STRING,
        defaultValue: "",
    },
    event_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'tickets',
            key: 'event_id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: "proposal",
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
    },
  }, {
    sequelize,
    modelName: 'Auction',
    timestamps: false,
  });
  return Auction;
};
