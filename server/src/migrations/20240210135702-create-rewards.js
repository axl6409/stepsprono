'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  /**
   * Create the Rewards table in the database.
   *
   * @param {Object} queryInterface - Query interface for interacting with the database
   * @param {Object} Sequelize - Sequelize object for defining data types
   * @return {Promise} A promise that resolves when the table is created
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('rewards', {
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
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'slug'
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'description'
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'image'
      },
      rank: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'rank'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'type'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'active'
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
    })
  },

  /**
   * Asynchronously brings down changes to the database schema.
   *
   * @param {Object} queryInterface - Interface for making changes to the database schema
   * @param {Object} Sequelize - Sequelize object for data type definitions
   * @return {Promise} A promise that resolves when the table is dropped
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('rewards');
  }
}