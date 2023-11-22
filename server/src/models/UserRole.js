const { DataTypes } = require('sequelize')
const sequelize = require('../../database')

const UserRole = sequelize.define('User_Role', {
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