const { DataTypes } = require('sequelize');
const sequelize = require('../../database');
const { Team } = require('./Team');

const Match = sequelize.define('Match', {
  homeTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id'
    }
  },
  awayTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  homeTeamScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  awayTeamScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'upcoming'
  }
})

module.exports = Match