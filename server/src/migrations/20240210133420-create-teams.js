'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'logo_url',
      },
      venueName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_name',
      },
      venueAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_address',
      },
      venueCity: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_city',
      },
      venueCapacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'venue_capacity',
      },
      venueImage: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'venue_image',
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
    await queryInterface.dropTable('Team');
  }
};
