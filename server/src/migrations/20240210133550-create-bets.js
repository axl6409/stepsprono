'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Bets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        field: 'user_id',
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
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      competitionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Competitions',
          key: 'id',
        },
        field: 'competition_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      matchday: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      matchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Matches',
          key: 'id',
        },
        field: 'match_id',
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
      homeScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'home_score'
      },
      awayScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'away_score'
      },
      playerGoal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Players',
          key: 'id',
        },
        field: 'player_goal',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      points: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Bets');
  }
};
