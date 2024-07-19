'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TeamCompetitions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id',
        },
        field: 'team_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      competitionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Competitions',
          key: 'id',
        },
        field: 'competition_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      seasonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Seasons',
          key: 'id',
        },
        field: 'season_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      playedTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'played_total'
      },
      playedHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'played_home'
      },
      playedAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'played_away'
      },
      winTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'win_total'
      },
      winHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'win_home'
      },
      winAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'win_away'
      },
      drawTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'draw_total'
      },
      drawHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'draw_home'
      },
      drawAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'draw_away'
      },
      losesTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'loses_total'
      },
      losesHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'loses_home'
      },
      losesAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'loses_away'
      },
      form: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      goalsFor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_for'
      },
      goalsAgainst: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goals_against'
      },
      goalDifference: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'goal_difference'
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
    await queryInterface.dropTable('TeamCompetitions');
  }
};
