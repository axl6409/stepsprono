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
  areaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seasonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winner: {
    type: DataTypes.STRING,
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
})

module.exports = Match