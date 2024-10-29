/**
 * Defines the 'Bet' model in the database.
 *
 * @param {Object} sequelize - The Sequelize object for interacting with the database.
 * @param {Object} DataTypes - The Sequelize object for defining the table schema.
 * @return {Object} The defined 'Bet' model.
 */
module.exports = (sequelize, DataTypes) => {
  const Bet = sequelize.define('Bet', {
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
    },
    result_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'result_points'
    },
    score_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'score_points'
    },
    scorer_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'scorer_points'
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
    tableName: 'bets',
    timestamps: true
  });

  /**
   * Associates the 'Bet' model with other models in the database.
   *
   * @param {Object} models - The models object containing the models to associate with.
   * @return {void} This function does not return anything.
   */
  Bet.associate = (models) => {
    Bet.belongsTo(models.User, { foreignKey: 'user_id', as: 'UserId' });
    Bet.belongsTo(models.Competition, { foreignKey: 'competition_id' });
    Bet.belongsTo(models.Season, { foreignKey: 'season_id' });
    Bet.belongsTo(models.Match, { foreignKey: 'match_id', as: 'MatchId' });
    Bet.belongsTo(models.Team, { foreignKey: 'winner_id' });
    Bet.belongsTo(models.Player, { foreignKey: 'player_goal', as: 'PlayerGoal' });
  };

  return Bet;
};
