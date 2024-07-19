'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Matches', { // Assurez-vous que le nom de la table correspond à votre convention
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      utcDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'utc_date'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      venue: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      matchday: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      stage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      homeTeamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
        },
        field: 'home_team_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      awayTeamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
        },
        field: 'away_team_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      league: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Competitions',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      season: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Seasons',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      winnerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Teams',
          key: 'id',
        },
        field: 'winner_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      goalsHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_home'
      },
      goalsAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_away'
      },
      scoreFullTimeHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_full_time_home'
      },
      scoreFullTimeAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_full_time_away'
      },
      scoreHalfTimeHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_half_time_home'
      },
      scoreHalfTimeAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_half_time_away'
      },
      scoreExtraTimeHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_extra_time_home'
      },
      scoreExtraTimeAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_extra_time_away'
      },
      scorePenaltyHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'score_penalty_home'
      },
      scorers: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Matches');
  }
};
