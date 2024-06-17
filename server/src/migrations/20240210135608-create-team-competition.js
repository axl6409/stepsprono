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
      },
      playedHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      playedAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      winTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      winHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      winAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      drawTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      drawHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      drawAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      losesTotal: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      losesHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      losesAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      },
      goalsAgainst: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      goalDifference: {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('TeamCompetitions');
  }
};
