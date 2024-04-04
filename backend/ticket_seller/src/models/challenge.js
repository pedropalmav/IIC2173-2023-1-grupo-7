'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Challenge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        this.hasMany(models.Job, {
            foreignKey: 'deposit_token',
            sourceKey: 'deposit_token',
            as: 'job',
        });
    }
  }
  Challenge.init({
    deposit_token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    }
  }, {
    sequelize,
    modelName: 'Challenge',
    timestamps: false,
  });
  return Challenge;
};
