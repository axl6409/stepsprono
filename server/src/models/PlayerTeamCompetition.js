module.exports = (sequelize, DataTypes) => {
  const PlayerTeamCompetition = sequelize.define('PlayerTeamCompetition', {
    playerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Roles',
        key: 'id',
      }
    },
    competitionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Competitions',
        key: 'id',
      }
    }
  });

  return PlayerTeamCompetition;
};
