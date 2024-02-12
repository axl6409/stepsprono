'use strict';

const {hash} = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await hash('admin', 10);
    await queryInterface.bulkInsert('Users', [
      { username: 'admin', email: 'admin@admin.fr', password: hashedPassword, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
