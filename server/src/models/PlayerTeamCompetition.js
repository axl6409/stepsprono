module.exports = (sequelize, DataTypes) => {
  const PlayerTeamCompetition = sequelize.define('PlayerTeamCompetition', {
    playerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Players',
        key: 'id',
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Teams',
        key: 'id',
      }
    },
    competitionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Competitions',
        key: 'id',
      }
    }
  });

  PlayerTeamCompetition.associate = (models) => {
    PlayerTeamCompetition.belongsTo(models.Player, { foreignKey: 'playerId' });
    PlayerTeamCompetition.belongsTo(models.Team, { foreignKey: 'teamId' });
    PlayerTeamCompetition.belongsTo(models.Competition, { foreignKey: 'competitionId' });
  }

  return PlayerTeamCompetition;
};
