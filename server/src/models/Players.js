const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Players = sequelize.define('Players', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
})

module.exports = Players