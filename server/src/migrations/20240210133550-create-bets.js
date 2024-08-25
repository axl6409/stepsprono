'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'bets' table in the database.
   *
   * @param {Object} queryInterface - The query interface object for interacting with the database.
   * @param {Object} Sequelize - The Sequelize object for defining the table schema.
   * @return {Promise<void>} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('bets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      user_id: {
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
      season_id: {
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
      competition_id: {
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
        field: 'matchday'
      },
      match_id: {
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
      winner_id: {
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
      home_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'home_score'
      },
      away_score: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'away_score'
      },
      player_goal: {
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
        field: 'points'
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
   * Asynchronously brings down changes to the database schema.
   *
   * @param {Object} queryInterface - Interface for making changes to the database schema
   * @param {Object} Sequelize - Sequelize object for data type definitions
   * @return {Promise} A promise that resolves when the table is dropped
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('bets');
  }
};
