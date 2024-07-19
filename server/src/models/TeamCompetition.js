module.exports = (sequelize, DataTypes) => {
  const TeamCompetition = sequelize.define('TeamCompetition', {
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Team',
        key: 'id'
      },
      field: 'team_id'
    },
    competitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competition',
        key: 'id'
      },
      field: 'competition_id'
    },
    seasonId: {
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
    },
    playedTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'played_total'
    },
    playedHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'played_home'
    },
    playedAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'played_away'
    },
    winTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'win_total'
    },
    winHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'win_home'
    },
    winAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'win_away'
    },
    drawTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'draw_total'
    },
    drawHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'draw_home'
    },
    drawAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'draw_away'
    },
    losesTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loses_total'
    },
    losesHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loses_home'
    },
    losesAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'loses_away'
    },
    form: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goalsFor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_for'
    },
    goalsAgainst: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goals_against'
    },
    goalDifference: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'goal_difference'
    }
  }, {
    tableName: 'TeamCompetitions',
  });

  TeamCompetition.associate = (models) => {
    TeamCompetition.belongsTo(models.Team, { foreignKey: 'teamId' });
    TeamCompetition.belongsTo(models.Competition, { foreignKey: 'competitionId' });
    TeamCompetition.belongsTo(models.Season, { foreignKey: 'seasonId' });
  };

  return TeamCompetition;
};
