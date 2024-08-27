'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  /**
   * Creates the 'users' table in the database with the specified columns.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'username'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'email'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'password'
      },
      img: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'img'
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Teams',
          key: 'id'
        },
        field: 'team_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'status'
      },
      last_connect: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'last_connect'
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
   * Asynchronously drops the 'users' table from the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};