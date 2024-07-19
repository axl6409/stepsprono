module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define('Season', {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    competitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Competitions',
        key: 'id',
      },
      field: 'competition_id'
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Teams',
        key: 'id',
      },
      field: 'winner_id'
    },
    current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    currentMatchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'current_matchday'
    }
  }, {
    tableName: 'Seasons',
  });

  Season.associate = (models) => {
    Season.belongsTo(models.Competition, { foreignKey: 'competitionId' });
    Season.belongsTo(models.Team, { foreignKey: 'winnerId' });
  };

  return Season;
};
