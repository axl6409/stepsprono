'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Inserts initial roles into the 'Roles' table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize instance.
   * @return {Promise<void>} A promise that resolves when the roles are inserted.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      { name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'manager', createdAt: new Date(), updatedAt: new Date() },
      { name: 'treasurer', createdAt: new Date(), updatedAt: new Date() },
      { name: 'user', createdAt: new Date(), updatedAt: new Date() },
      { name: 'visitor', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  /**
   * Asynchronously deletes all records from the 'Roles' table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize instance.
   * @return {Promise<void>} A promise that resolves when the records are deleted.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
