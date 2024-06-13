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
    await queryInterface.createTable('Rewards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rank: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
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
    await queryInterface.dropTable('Rewards');
  }
}