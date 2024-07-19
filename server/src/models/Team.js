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
      field: 'logo_url'
    },
    venueName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_name'
    },
    venueAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_address'
    },
    venueCity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_city'
    },
    venueCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'venue_capacity'
    },
    venueImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_image'
    },
  }, {
    tableName: 'Teams',
  });

  Team.associate = (models) => {
    Team.hasMany(models.Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
    Team.hasMany(models.Match, { as: 'awayMatches', foreignKey: 'awayTeamId' })
    Team.hasMany(models.Bet, { foreignKey: 'winnerId' })
    Team.belongsToMany(models.Player, { through: models.PlayerTeamCompetition, foreignKey: 'teamId' });
    Team.hasMany(models.TeamCompetition, { as: 'TeamCompetition', foreignKey: 'teamId' });
    Team.hasMany(models.User, { foreignKey: 'teamId', as: 'users' });
  };

  return Team;
};
