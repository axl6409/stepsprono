'use strict';

const {hash} = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Inserts a new user with the username 'admin', email 'admin@admin.fr', and hashed password 'admin' into the 'Users' table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize object.
   * @return {Promise<void>} A promise that resolves when the user is successfully inserted.
   */
  async up (queryInterface, Sequelize) {
    const hashedPassword = await hash('admin', 10);
    await queryInterface.bulkInsert('Users', [
      { username: 'admin', email: 'admin@admin.fr', password: hashedPassword, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  /**
   * Deletes all records from the 'Users' table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize object.
   * @return {Promise<void>} A promise that resolves when the records are successfully deleted.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
