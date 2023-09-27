const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const Role = sequelize.define('Role', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
})

module.exports = Role