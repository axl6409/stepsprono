module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'name'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'code'
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'logo_url'
    },
    venue_name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_name'
    },
    venue_address: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_address'
    },
    venue_city: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_city'
    },
    venue_capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'venue_capacity'
    },
    venue_image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'venue_image'
    },
  });

  Team.associate = (models) => {
    Team.hasMany(models.match, { as: 'homeMatches', foreignKey: 'home_team_id' });
    Team.hasMany(models.match, { as: 'awayMatches', foreignKey: 'away_team_id' })
    Team.hasMany(models.bet, { foreignKey: 'winner_id' })
    Team.belongsToMany(models.player, { through: models.player_team_competition, foreignKey: 'team_id' });
    Team.hasMany(models.team_competition, { as: 'TeamCompetition', foreignKey: 'team_id' });
    Team.hasMany(models.user, { foreignKey: 'team_id', as: 'users' });
  };

  return Team;
};
