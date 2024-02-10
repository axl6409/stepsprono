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
        model: 'Season',
        key: 'id',
      }
    },
    competitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competition',
        key: 'id',
      }},
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
        model: 'Team',
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
        model: 'Player',
        key: 'id',
      }
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  });

  Bet.associate = (models) => {
    Bet.belongsTo(models.User, { foreignKey: 'userId' });
    Bet.belongsTo(models.Match, { foreignKey: 'matchId' });
  };

  return Bet;
};
