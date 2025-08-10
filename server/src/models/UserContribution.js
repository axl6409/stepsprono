/**
 * Defines the Contribution model for Sequelize and sets up associations with other models.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The Sequelize DataTypes object.
 * @return {Object} The User model.
 */
module.exports = (sequelize, DataTypes) => {
  const UserContribution = sequelize.define('UserContribution', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
      field: 'user_id'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'status'
    },
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'matchday'
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'amount'
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Season',
        key: 'id',
      },
      field: 'season_id'
    },
    competition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competition',
        key: 'id',
      },
      field: 'competition_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'user_contributions',
    timestamps: false
  });

  /**
   * Associates the User model with other models.
   *
   * @param {Object} models - The Sequelize models object.
   * @return {void} This function does not return anything.
   */
  UserContribution.associate = (models) => {
    UserContribution.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    UserContribution.belongsTo(models.Season, { foreignKey: 'season_id', as: 'Season' });
    UserContribution.belongsTo(models.Competition, { foreignKey: 'competition_id', as: 'Competition' });
  };

  return UserContribution;
};