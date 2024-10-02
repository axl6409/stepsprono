'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  /**
   * Updates the "updated_at" column of the "areas" table before each update.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize object.
   * @return {Promise<void>} A promise that resolves when the function completes.
   */
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW."updated_at" = NOW();
         RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_areas_updated_at BEFORE UPDATE
      ON "areas" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    `);
  },

  /**
   * Drops the trigger and function for updating the "updated_at" column of the "areas" table.
   *
   * @param {Object} queryInterface - The Sequelize query interface.
   * @param {Object} Sequelize - The Sequelize object.
   * @return {Promise<void>} A promise that resolves when the function completes.
   */
  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_areas_updated_at ON "areas";
      DROP FUNCTION IF EXISTS update_updated_at_column;
    `);
  }
};
