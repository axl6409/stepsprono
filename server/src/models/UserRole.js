const { DataTypes } = require('sequelize')
const sequelize = require('../../database')
const {User, Role} = require("./index");

const UserRole = sequelize.define('UserRole', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    primaryKey: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
    primaryKey: true
  }
})

module.exports = UserRole