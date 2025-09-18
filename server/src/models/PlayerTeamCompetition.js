/**
 * Defines the PlayerTeamCompetition model in Sequelize.
 *
 * @param {Object} sequelize - The Sequelize instance.
 * @param {Object} DataTypes - The Sequelize DataTypes object.
 * @return {Object} The PlayerTeamCompetition model.
 */
module.exports = (sequelize, DataTypes) => {
  const PlayerTeamCompetition = sequelize.define('PlayerTeamCompetition', {
    player_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Player',
        key: 'id',
      },
      field: 'player_id'
    },
    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Team',
        key: 'id',
      },
      field: 'team_id'
    },
    competition_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Competitions',
        key: 'id',
      },
      field: 'competition_id'
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'number'
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'position'
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
    tableName: 'player_team_competitions',
    timestamps: true
  });

  /**
   * Associates the PlayerTeamCompetition model with the Player, Team, and Competition models.
   *
   * @param {Object} models - The Sequelize models object.
   * @return {void}
   */
  PlayerTeamCompetition.associate = (models) => {
    PlayerTeamCompetition.belongsTo(models.Player, { foreignKey: 'player_id' });
    PlayerTeamCompetition.belongsTo(models.Team, { foreignKey: 'team_id' });
    PlayerTeamCompetition.belongsTo(models.Competition, { foreignKey: 'competition_id' });
  }

  return PlayerTeamCompetition;
};
