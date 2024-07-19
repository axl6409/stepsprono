module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('player', {
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
  });

  Player.associate = (models) => {
    Player.belongsToMany(models.team, { through: models.player_team_competition, foreignKey: 'player_id' });
    Player.hasMany(models.bet, { foreignKey: 'player_goal' })
  };

  return Player;
};
