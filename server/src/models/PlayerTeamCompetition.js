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

  return PlayerTeamCompetition;
};
