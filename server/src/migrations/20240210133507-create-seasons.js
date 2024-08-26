'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'seasons' table in the database.
   *
   * @param {Object} queryInterface - The query interface object provided by Sequelize.
   * @param {Object} Sequelize - The Sequelize object.
   * @return {Promise<void>} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('seasons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'year'
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'start_date'
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'end_date'
      },
      competition_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Competitions',
          key: 'id'
        },
        field: 'competition_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        allowNull: false
      },
      winner_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Teams',
          key: 'id'
        },
        field: 'winner_id',
        allowNull: true
      },
      current: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'current'
      },
      current_matchday: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'current_matchday'
      },
      scheduled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'scheduled'
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
   * Asynchronously drops the 'seasons' table from the database.
   *
   * @param {Object} queryInterface - The query interface object provided by Sequelize.
   * @param {Object} Sequelize - The Sequelize object.
   * @return {Promise<void>} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('seasons');
  }
};
