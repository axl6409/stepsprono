'use strict';

/**
 * Modèle pour gérer les utilisateurs actifs par saison.
 * 
 * @param {Object} sequelize - Instance de Sequelize
 * @param {Object} DataTypes - Types de données Sequelize
 * @return {Object} Modèle UserSeason
 */
module.exports = (sequelize, DataTypes) => {
  const UserSeason = sequelize.define('UserSeason', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
      field: 'user_id',
      primaryKey: true
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Season',
        key: 'id',
      },
      field: 'season_id',
      primaryKey: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    final_ranking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'final_ranking'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'user_seasons',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'season_id']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  /**
   * Associations du modèle UserSeason
   * @param {Object} models - Les modèles Sequelize
   */
  UserSeason.associate = (models) => {
    UserSeason.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    UserSeason.belongsTo(models.Season, {
      foreignKey: 'season_id',
      as: 'season'
    });
  };

  return UserSeason;
};
