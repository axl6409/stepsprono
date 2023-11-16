const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Team = sequelize.define('Team', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tla: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  playedGames: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  won: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  draw: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lost: {
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
})

module.exports = Team