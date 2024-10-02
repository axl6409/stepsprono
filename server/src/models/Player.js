/**
 * Defines the Player model for the sequelize ORM.
 *
 * @param {Object} sequelize - The sequelize instance.
 * @param {Object} DataTypes - The data types provided by sequelize.
 * @return {Object} The defined Player model.
 */
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

  /**
   * Associates the Player model with the Team and Bet models.
   *
   * @param {Object} models - The models object containing the Team and Bet models.
   * @return {void}
   */
  Player.associate = (models) => {
    Player.belongsToMany(models.Team, { through: models.PlayerTeamCompetition, foreignKey: 'player_id' });
    Player.hasMany(models.Bet, { foreignKey: 'player_goal' })
  };

  return Player;
};
