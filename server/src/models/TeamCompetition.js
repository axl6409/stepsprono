module.exports = (sequelize, DataTypes) => {
  const TeamCompetition = sequelize.define('TeamCompetition', {
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Team',
        key: 'id'
      }
    },
    competitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competition',
        key: 'id'
      }
    },
    seasonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Season',
        key: 'id'
      }
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playedTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playedHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playedAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    losesTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    losesHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    losesAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    },
    goalsAgainst: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goalDifference: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
