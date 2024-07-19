'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
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
          model: 'Players',
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
          model: 'Teams',
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
          model: 'Competitions',
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

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('player_team_competitions');
  }
};
