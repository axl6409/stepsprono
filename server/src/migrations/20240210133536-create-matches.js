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
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      goalsHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      goalsAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scoreFullTimeHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scoreFullTimeAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scoreHalfTimeHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scoreHalfTimeAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scoreExtraTimeHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scoreExtraTimeAway: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scorePenaltyHome: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      scorers: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('Matches');
  }
};
