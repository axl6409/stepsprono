'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('competitions', {
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
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Areas',
          key: 'id'
        },
        field: 'area_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'type'
      },
      emblem: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'emblem'
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
    await queryInterface.dropTable('competitions');
  }
};
