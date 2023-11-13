const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Settings = sequelize.define('Settings', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  activeOption: {
    type: DataTypes.STRING,
    allowNull: true
  }
})

module.exports = Settings