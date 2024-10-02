'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'competitions' table in the database with the specified columns.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is created.
   */
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
          model: 'areas',
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

  /**
   * Asynchronously drops the 'competitions' table from the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('competitions');
  }
};
