'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Challenges', {
      deposit_token: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Challenges');
  }
};
