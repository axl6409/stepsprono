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
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      homeScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      awayScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      playerGoal: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Players',
          key: 'id',
        },
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Bets');
  }
};
