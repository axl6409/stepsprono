'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('scheduled_tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'type',
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'scheduled_at',
      },
      job_id: {
        type: Sequelize.STRING,
        field: 'job_id',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        field: 'status',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at',
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'updated_at',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('scheduled_tasks');
  }
};
