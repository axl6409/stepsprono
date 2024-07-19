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
    tableName: 'players',
    timestamps: true
  });

  Player.associate = (models) => {
    Player.belongsToMany(models.Team, { through: models.PlayerTeamCompetition, foreignKey: 'player_id' });
    Player.hasMany(models.Bet, { foreignKey: 'player_goal' })
  };

  return Player;
};
