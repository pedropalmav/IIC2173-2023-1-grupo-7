'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        this.belongsTo(models.Challenge, {
            foreignKey: 'deposit_token',
            targetKey: 'deposit_token',
            as: 'challenge',
        });
    }
  }
  Job.init({
    deposit_token: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'Challenges',
            key: 'deposit_token',
        },
    },
    challenge_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    secret: {
        type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'Job',
    timestamps: false,
  });
  return Job;
};
