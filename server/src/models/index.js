const sequelize = require('../../database');
const User = require('./User');
const Role = require('./Role');
const UserRole = require('./UserRole');
const Teams = require('./Teams');

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Teams
};
