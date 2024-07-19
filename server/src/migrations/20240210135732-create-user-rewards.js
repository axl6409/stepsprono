'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_rewards', {
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
        field: 'user_id',
      },
      reward_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'reward_id',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_rewards');
  }
}