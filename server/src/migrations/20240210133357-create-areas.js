'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  /**
   * Creates a new table named 'areas' in the database. The table has the following columns:
   * - id: an auto-incrementing integer primary key
   * - name: a non-null string
   * - code: a non-null unique string
   * - flag: a nullable string
   * - created_at: a non-null date with a default value of the current timestamp
   * - updated_at: a non-null date with a default value of the current timestamp
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database
   * @param {Object} Sequelize - The Sequelize object for defining data types
   * @return {Promise} A promise that resolves when the table is created
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('areas', {
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
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'code'
      },
      flag: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'flag'
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
   * Drops the 'areas' table from the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining data types.
   * @return {Promise} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('areas');
  }
};
