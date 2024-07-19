module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('match', {
    utc_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'user_id'
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
      type: DataTypes.STRING,
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
    }
  });

  Match.associate = (models) => {
    Match.belongsTo(models.team, { as: 'HomeTeam', foreignKey: 'homeTeamId' });
    Match.belongsTo(models.team, { as: 'AwayTeam', foreignKey: 'awayTeamId' });
    Match.hasMany(models.bet, { foreignKey: 'matchId', as: 'MatchId' })
    Match.belongsTo(models.season, { foreignKey: 'season_id', as: 'Season' });
    Match.belongsTo(models.competition, { foreignKey: 'competition_id', as: 'Competition' });
  };

  return Match;
};
