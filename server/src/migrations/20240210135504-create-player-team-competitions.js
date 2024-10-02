'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Creates the 'player_team_competitions' table in the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the table is created.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('player_team_competitions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      player_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'players',
          key: 'id',
        },
        field: 'player_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      team_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'teams',
          key: 'id',
        },
        field: 'team_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      competition_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'competitions',
          key: 'id',
        },
        field: 'competition_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
   * Drops the 'player_team_competitions' table from the database.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the table is dropped.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('player_team_competitions');
  }
};
