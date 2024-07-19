'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Seasons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'start_date'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'end_date'
      },
      competitionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Competitions',
          key: 'id'
        },
        field: 'competition_id',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        allowNull: false
      },
      winnerId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Teams',
          key: 'id'
        },
        field: 'winner_id',
        allowNull: true
      },
      current: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      currentMatchday: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'current_matchday'
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
    await queryInterface.dropTable('Season');
  }
};
