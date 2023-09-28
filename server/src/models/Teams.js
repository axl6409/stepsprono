const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Teams = sequelize.define('Teams', {
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
  }
})

module.exports = Teams