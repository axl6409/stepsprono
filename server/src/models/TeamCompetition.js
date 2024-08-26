/**
 * Defines the TeamCompetition model for the Sequelize ORM.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The data types provided by Sequelize.
 * @return {Object} The defined TeamCompetition model.
 */
module.exports = (sequelize, DataTypes) => {
  const TeamCompetition = sequelize.define('TeamCompetition', {
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Team',
        key: 'id'
      },
      field: 'team_id'
    },
    competition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competition',
        key: 'id'
      },
      field: 'competition_id'
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Season',
        key: 'id'
      },
      field: 'season_id'
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'position'
    },
    played_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'played_total'
    },
    played_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'played_home'
    },
    played_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'played_away'
    },
    win_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'win_total'
    },
    win_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'win_home'
    },
    win_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'win_away'
    },
    draw_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'draw_total'
    },
    draw_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'draw_home'
    },
    draw_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'draw_away'
    },
    loses_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loses_total'
    },
    loses_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loses_home'
    },
    loses_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loses_away'
    },
    form: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'form'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'points'
    },
    goals_for: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_for'
    },
    goals_against: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_against'
    },
    goals_difference: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_difference'
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
    tableName: 'team_competitions',
    timestamps: true
  });

  /**
   * Associates the TeamCompetition model with the Team, Competition, and Season models.
   *
   * @param {Object} models - The models object containing the Team, Competition, and Season models.
   * @return {void} This function does not return anything.
   */
  TeamCompetition.associate = (models) => {
    TeamCompetition.belongsTo(models.Team, { foreignKey: 'team_id' });
    TeamCompetition.belongsTo(models.Competition, { foreignKey: 'competition_id' });
    TeamCompetition.belongsTo(models.Season, { foreignKey: 'season_id' });
  };

  return TeamCompetition;
};
