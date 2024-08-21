module.exports = (sequelize, DataTypes) => {
  const PlayerTeamCompetition = sequelize.define('PlayerTeamCompetition', {
    player_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Player',
        key: 'id',
      },
      field: 'player_id'
    },
    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Team',
        key: 'id',
      },
      field: 'team_id'
    },
    competition_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Competitions',
        key: 'id',
      },
      field: 'competition_id'
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
    tableName: 'player_team_competitions',
    timestamps: true
  });

  PlayerTeamCompetition.associate = (models) => {
    PlayerTeamCompetition.belongsTo(models.Player, { foreignKey: 'player_id' });
    PlayerTeamCompetition.belongsTo(models.Team, { foreignKey: 'team_id' });
    PlayerTeamCompetition.belongsTo(models.Competition, { foreignKey: 'competition_id' });
  }

  return PlayerTeamCompetition;
};
