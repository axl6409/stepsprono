'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
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

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_areas_updated_at ON "areas";
      DROP FUNCTION IF EXISTS update_updated_at_column;
    `);
  }
};
