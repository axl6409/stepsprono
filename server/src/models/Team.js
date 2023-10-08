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
  }
})

module.exports = Team