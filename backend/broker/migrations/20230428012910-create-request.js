'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Requests', {
      request_id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      group_id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.STRING,
        references: {
          model: 'tickets',
          key: 'event_id'
        }
      },
      deposit_token: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      seller: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Requests');
  }
};
