module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venueName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    venueAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    venueCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    venueCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    venueImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Team.associate = (models) => {
    Team.hasMany(models.Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
    Team.hasMany(models.Match, { as: 'awayMatches', foreignKey: 'awayTeamId' })
    Team.hasMany(models.Bet, { foreignKey: 'winnerId' })
    Team.belongsToMany(models.Player, { through: models.PlayerTeamCompetition, foreignKey: 'teamId' });
  };

  return Team;
};
