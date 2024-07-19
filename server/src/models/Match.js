module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    utcDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'user_id'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    homeTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'home_team_id'
    },
    awayTeamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'away_team_id'
    },
    league: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    season: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    winnerId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'winner_id'
    },
    goalsHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_home'
    },
    goalsAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_away'
    },
    scoreFullTimeHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_full_time_home'
    },
    scoreFullTimeAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_full_time_away'
    },
    scoreHalfTimeHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_half_time_home'
    },
    scoreHalfTimeAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_half_time_away'
    },
    scoreExtraTimeHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_extra_time_home'
    },
    scoreExtraTimeAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_extra_time_away'
    },
    scorePenaltyHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_penalty_home'
    },
    scorers: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }, {
    tableName: 'Matchs',
  });

  Match.associate = (models) => {
    Match.belongsTo(models.Team, { as: 'HomeTeam', foreignKey: 'homeTeamId' });
    Match.belongsTo(models.Team, { as: 'AwayTeam', foreignKey: 'awayTeamId' });
    Match.hasMany(models.Bet, { foreignKey: 'matchId', as: 'MatchId' })
  };

  return Match;
};
