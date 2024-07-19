module.exports = (sequelize, DataTypes) => {
  const Bet = sequelize.define('bet', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id'
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
    competition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competitions',
        key: 'id',
      },
      field: 'competition_id'
    },
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'matchday'
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Matches',
        key: 'id',
      },
      field: 'match_id'
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
    home_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'home_score'
    },
    away_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'away_score'
    },
    player_goal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Players',
        key: 'id',
      },
      field: 'player_goal'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'points'
    }
  });

  Bet.associate = (models) => {
    Bet.belongsTo(models.user, { foreignKey: 'user_id' });
    Bet.belongsTo(models.competition, { foreignKey: 'competition_id' });
    Bet.belongsTo(models.season, { foreignKey: 'season_id' });
    Bet.belongsTo(models.match, { foreignKey: 'match_id', as: 'MatchId' });
    Bet.belongsTo(models.team, { foreignKey: 'winner_id' });
    Bet.belongsTo(models.player, { foreignKey: 'player_goal', as: 'PlayerGoal' });
  };

  return Bet;
};
