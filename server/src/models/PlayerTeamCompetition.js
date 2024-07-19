module.exports = (sequelize, DataTypes) => {
  const PlayerTeamCompetition = sequelize.define('player_team_competition', {
    player_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Players',
        key: 'id',
      },
      field: 'player_id'
    },
    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Teams',
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
    }
  });

  PlayerTeamCompetition.associate = (models) => {
    PlayerTeamCompetition.belongsTo(models.player, { foreignKey: 'player_id' });
    PlayerTeamCompetition.belongsTo(models.team, { foreignKey: 'team_id' });
    PlayerTeamCompetition.belongsTo(models.competition, { foreignKey: 'competition_id' });
  }

  return PlayerTeamCompetition;
};
