const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Match = sequelize.define('Match', {
  utcDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  matchday: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  homeTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  awayTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  league: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  season: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  goalsHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  goalsAway: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreFullTimeHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreFullTimeAway: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreHalfTimeHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreHalfTimeAway: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreExtraTimeHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreExtraTimeAway: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scorePenaltyHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scorers: {
    type: DataTypes.JSON,
    allowNull: true,
  }
})

module.exports = Match