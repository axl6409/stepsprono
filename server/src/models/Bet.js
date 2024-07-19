module.exports = (sequelize, DataTypes) => {
  const Bet = sequelize.define('Bet', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    seasonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Seasons',
        key: 'id',
      }
    },
    competitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competitions',
        key: 'id',
      }},
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Matches',
        key: 'id',
      }
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id',
      }
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playerGoal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Players',
        key: 'id',
      }
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: 'Bets',
  });

  Bet.associate = (models) => {
    Bet.belongsTo(models.User, { foreignKey: 'userId' });
    Bet.belongsTo(models.Competition, { foreignKey: 'competitionId' });
    Bet.belongsTo(models.Season, { foreignKey: 'seasonId' });
    Bet.belongsTo(models.Match, { foreignKey: 'matchId', as: 'MatchId' });
    Bet.belongsTo(models.Team, { foreignKey: 'winnerId' });
    Bet.belongsTo(models.Player, { foreignKey: 'playerGoal', as: 'PlayerGoal' });
  };

  return Bet;
};
