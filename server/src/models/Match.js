/**
 * Defines the Match model for the sequelize ORM.
 *
 * @param {Object} sequelize - The sequelize instance.
 * @param {Object} DataTypes - The data types provided by sequelize.
 * @return {Object} The defined Match model.
 */

module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    utc_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'utc_date'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'status'
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue'
    },
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'matchday'
    },
    stage: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'stage'
    },
    require_details: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'require_details'
    },
    home_team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'home_team_id'
    },
    away_team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'away_team_id'
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
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Seasons',
        key: 'id',
      },
      field: 'season_id'
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
    goals_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_home'
    },
    goals_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_away'
    },
    score_full_time_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_full_time_home'
    },
    score_full_time_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_full_time_away'
    },
    score_half_time_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_half_time_home'
    },
    score_half_time_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_half_time_away'
    },
    score_extra_time_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_extra_time_home'
    },
    score_extra_time_away: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_extra_time_away'
    },
    score_penalty_home: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_penalty_home'
    },
    scorers: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'scorers'
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
    tableName: 'matchs',
    timestamps: true
  });

  /**
   * Associates the Match model with other models in the sequelize ORM.
   *
   * @param {Object} models - The sequelize models.
   * @return {void}
   */
  Match.associate = (models) => {
    Match.belongsTo(models.Team, { as: 'HomeTeam', foreignKey: 'home_team_id' });
    Match.belongsTo(models.Team, { as: 'AwayTeam', foreignKey: 'away_team_id' });
    Match.hasMany(models.Bet, { foreignKey: 'match_id', as: 'MatchId' })
    Match.belongsTo(models.Season, { foreignKey: 'season_id', as: 'Season' });
    Match.belongsTo(models.Competition, { foreignKey: 'competition_id', as: 'Competition' });
  };

  return Match;
};
