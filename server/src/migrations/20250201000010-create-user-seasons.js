'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_seasons', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'seasons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      final_ranking: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Création d'un index composite unique sur user_id et season_id
    await queryInterface.addIndex('user_seasons', ['user_id', 'season_id'], {
      unique: true,
      name: 'user_seasons_user_id_season_id_key'
    });

    // Création d'un index sur is_active pour les requêtes de filtrage
    await queryInterface.addIndex('user_seasons', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    // Suppression des index d'abord pour éviter les problèmes de contrainte
    await queryInterface.removeIndex('user_seasons', 'user_seasons_user_id_season_id_key');
    await queryInterface.removeIndex('user_seasons', ['is_active']);
    
    // Suppression de la table
    await queryInterface.dropTable('user_seasons');
  }
};
