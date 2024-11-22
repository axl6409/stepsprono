module.exports = (sequelize, DataTypes) => {
  const UserRanking = sequelize.define('UserRanking', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id',
    },
    competition_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competitions',
        key: 'id',
      },
      field: 'competition_id',
    },
    season_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Seasons',
        key: 'id',
      },
      field: 'season_id',
    },
    matchday: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'matchday',
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'position',
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'points',
    },
    result_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'result_points',
    },
    score_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'score_points',
    },
    scorer_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'scorer_points',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {
    tableName: 'user_rankings',
    timestamps: true,
  });

  UserRanking.associate = (models) => {
    UserRanking.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    UserRanking.belongsTo(models.Season, { foreignKey: 'season_id', as: 'Season' });
    UserRanking.belongsTo(models.Competition, { foreignKey: 'competition_id', as: 'Competition' });
  };

  return UserRanking;
};