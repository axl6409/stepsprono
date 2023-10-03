const { DataTypes } = require('sequelize')
const sequelize = require('../../database')
const {User, Match, Team} = require("./index");

const Bets = sequelize.define('Bets', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    }
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Match,
      key: 'id',
    }
  },
  winnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id'
    }
  },
  score: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  playerGoal: {
    type: DataTypes.STRING,
    allowNull: true,
  }
})

module.exports = Bets