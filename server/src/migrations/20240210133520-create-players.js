'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'name'
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'firstname'
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'lastname'
      },
      photo: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'photo'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('players');
  }
};
