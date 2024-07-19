'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'key'
      },
      display_name: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'display_name',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'type',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'description',
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'options',
      },
      active_option: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'active_option',
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
    await queryInterface.dropTable('settings');
  }
};
