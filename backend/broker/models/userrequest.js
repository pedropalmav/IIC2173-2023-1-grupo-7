'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Request, {
        targetKey: 'request_id',
        foreignKey: 'request_id',
      });
    }
  }
  UserRequest.init({
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    email: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'UserRequest',
  });
  return UserRequest;
};
