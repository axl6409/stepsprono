module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define('Season', {
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'year'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
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
    winner_id: {
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
      field: 'current'
    },
    current_matchday: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'current_matchday'
    },
    scheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'scheduled'
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
    tableName: 'seasons',
    timestamps: true
  });

  Season.associate = (models) => {
    Season.belongsTo(models.Competition, { foreignKey: 'competition_id' });
    Season.belongsTo(models.Team, { foreignKey: 'winner_id' });
  };

  return Season;
};
