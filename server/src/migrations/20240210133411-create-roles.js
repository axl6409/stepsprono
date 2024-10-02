'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  /**
   * Creates the 'roles' table in the database with the specified columns.
   *
   * @param {Object} queryInterface - The query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise<void>} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
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
        unique: true,
        field: 'name'
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
   * Asynchronously drops the 'roles' table from the database.
   *
   * @param {Object} queryInterface - The query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise<void>} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  }
};
