const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Bets = sequelize.define('Bets', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  homeScore: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  awayScore: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  playerGoal: {
    type: DataTypes.STRING,
    allowNull: true,
  }
})

module.exports = Bets