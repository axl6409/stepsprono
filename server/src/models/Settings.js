const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Settings = sequelize.define('Settings', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false
  },
  activeOption: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

module.exports = Settings