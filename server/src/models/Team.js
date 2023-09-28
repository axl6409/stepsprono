const { DataTypes } = require('sequelize')
const sequelize = require('../../database')
const {League} = require("./index");

const Team = sequelize.define('Team', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: League,
      key: 'id'
    }
  }
})

module.exports = Team