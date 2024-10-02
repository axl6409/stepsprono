'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'user_rewards' table in the database with the specified columns.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_rewards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        field: 'user_id',
      },
      reward_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rewards',
          key: 'id',
        },
        field: 'reward_id',
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'count'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });
  },

  /**
   * Asynchronously drops the 'user_rewards' table from the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_rewards');
  }
}