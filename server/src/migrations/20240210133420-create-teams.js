'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'id'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'name'
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'code'
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'logo_url',
      },
      venue_name: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_name',
      },
      venue_address: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_address',
      },
      venue_city: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_city',
      },
      venue_capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'venue_capacity',
      },
      venue_image: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_image',
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
    await queryInterface.dropTable('teams');
  }
};
