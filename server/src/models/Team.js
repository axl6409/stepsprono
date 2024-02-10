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
    competitionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playedTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playedHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    playedAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    drawAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    losesTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    losesHome: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    losesAway: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    form: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goalsFor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goalsAgainst: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goalDifference: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  });

  Team.associate = (models) => {
    Team.hasMany(models.Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
    Team.hasMany(models.Match, { as: 'awayMatches', foreignKey: 'awayTeamId' })
    Team.hasMany(models.Bet, { foreignKey: 'winnerId' })
  };

  return Team;
};
