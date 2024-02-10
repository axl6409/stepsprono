module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Team',
        key: 'id',
      }
    },
  });

  Player.associate = (models) => {
    Player.belongsTo(models.Team, { foreignKey: 'teamId' });
  };

  return Player;
};
