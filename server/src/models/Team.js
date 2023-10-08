const { DataTypes } = require('sequelize')
const sequelize = require('../../database')
const {Competition} = require("./index");

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
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Competition,
      key: 'id'
    }
  }
})

module.exports = Team