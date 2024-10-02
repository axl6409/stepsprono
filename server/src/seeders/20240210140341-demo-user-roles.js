'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Inserts a new record into the 'UserRoles' table with the given userId and roleId.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the record is successfully inserted.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('UserRoles', [
      { userId: 1, roleId: 1 },
    ], {});
  },

  /**
   * Asynchronously deletes all records from the 'UserRoles' table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize library.
   * @return {Promise<void>} A promise that resolves when the records are deleted.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserRoles', null, {});
  }
};
