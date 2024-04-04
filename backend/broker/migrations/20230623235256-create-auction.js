'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Auctions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      auction_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      proposal_id: {
        type: Sequelize.STRING,
        defaultValue: "",
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'tickets',
          key: 'event_id',
        },
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        defaultValue: "proposal",
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "pending",
      },
    });
  },  

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Auctions');
  }
};
