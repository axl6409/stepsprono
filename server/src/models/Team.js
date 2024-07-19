module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
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
    tableName: 'teams',
    timestamps: true
  });

  Team.associate = (models) => {
    Team.hasMany(models.Match, { as: 'homeMatches', foreignKey: 'home_team_id' });
    Team.hasMany(models.Match, { as: 'awayMatches', foreignKey: 'away_team_id' })
    Team.hasMany(models.Bet, { foreignKey: 'winner_id' })
    Team.belongsToMany(models.Player, { through: models.PlayerTeamCompetition, foreignKey: 'team_id' });
    Team.hasMany(models.TeamCompetition, { as: 'TeamCompetition', foreignKey: 'team_id' });
    Team.hasMany(models.User, { foreignKey: 'team_id', as: 'users' });
  };

  return Team;
};
