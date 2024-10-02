'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'team_competitions' table in the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('team_competitions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
        field: 'team_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      competition_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'competitions',
          key: 'id',
        },
        field: 'competition_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'seasons',
          key: 'id',
        },
        field: 'season_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'position'
      },
      played_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'played_total'
      },
      played_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'played_home'
      },
      played_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'played_away'
      },
      win_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'win_total'
      },
      win_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'win_home'
      },
      win_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'win_away'
      },
      draw_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'draw_total'
      },
      draw_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'draw_home'
      },
      draw_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'draw_away'
      },
      loses_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'loses_total'
      },
      loses_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'loses_home'
      },
      loses_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'loses_away'
      },
      form: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'form'
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'points'
      },
      goals_for: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_for'
      },
      goals_against: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_against'
      },
      goals_difference: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_difference'
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
   * Drops the 'team_competitions' table from the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('team_competitions');
  }
};
