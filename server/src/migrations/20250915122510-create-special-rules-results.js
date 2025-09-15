'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('special_rules_results', {
      rule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'special_rules',
          key: 'id'
        }
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'seasons',
          key: 'id'
        }
      },
      config: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'config'
      },
      results: {
        type: Sequelize.JSON,
        allowNull: false,
        field: 'results'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: 'CURRENT_TIMESTAMP'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('special_rules_results');
  }
}