'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'matchs' table in the database with the specified columns.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('matchs', { // Assurez-vous que le nom de la table correspond à votre convention
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      utc_date: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'utc_date'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'status'
      },
      venue: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue'
      },
      matchday: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'matchday'
      },
      stage: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'stage'
      },
      require_details: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'require_details'
      },
      home_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
        field: 'home_team_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      away_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
        field: 'away_team_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      competition_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      winner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          key: 'id',
        },
        field: 'winner_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      goals_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_home'
      },
      goals_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_away'
      },
      score_full_time_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_full_time_home'
      },
      score_full_time_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_full_time_away'
      },
      score_half_time_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_half_time_home'
      },
      score_half_time_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_half_time_away'
      },
      score_extra_time_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_extra_time_home'
      },
      score_extra_time_away: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_extra_time_away'
      },
      score_penalty_home: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_penalty_home'
      },
      scorers: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'scorers'
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
   * Drops the 'matchs' table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('matchs');
  }
};
