'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        field: 'user_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Roles',
          key: 'id',
        },
        field: 'role_id',
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
    await queryInterface.dropTable('user_roles');
  }
};
