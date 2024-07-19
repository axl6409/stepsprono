'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'username'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'email'
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'password'
      },
      img: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'img'
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Teams',
          key: 'id'
        },
        field: 'team_id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'status'
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
    await queryInterface.dropTable('users');
  }
};
