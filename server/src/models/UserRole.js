const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const UserRole = sequelize.define('UserRole', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
})

module.exports = UserRole