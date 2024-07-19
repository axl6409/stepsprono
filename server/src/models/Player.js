module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'Players',
  });

  Player.associate = (models) => {
    Player.belongsToMany(models.Team, { through: models.PlayerTeamCompetition, foreignKey: 'playerId' });
    Player.hasMany(models.Bet, { foreignKey: 'playerGoal' })
  };

  return Player;
};
