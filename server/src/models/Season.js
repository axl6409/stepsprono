/**
 * Drops the 'seasons' table from the database.
 *
 * @param {Object} queryInterface - The Sequelize query interface.
 * @param {Object} Sequelize - The Sequelize library.
 * @return {Promise<void>} A promise that resolves when the table is dropped.
 */
module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define('Season', {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'year'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    competition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competitions',
        key: 'id',
      },
      field: 'competition_id'
    },
    winner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'winner_id'
    },
    current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'current'
    },
    current_matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'current_matchday'
    },
    scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'scheduled'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'seasons',
    timestamps: true
  });

  /**
   * Associates the Season model with the Competition and Team models.
   *
   * @param {Object} models - The Sequelize models object.
   * @return {void} This function does not return anything.
   */
  Season.associate = (models) => {
    Season.belongsTo(models.Competition, { foreignKey: 'competition_id' });
    Season.belongsTo(models.Team, { foreignKey: 'winner_id' });
  };

  return Season;
};
