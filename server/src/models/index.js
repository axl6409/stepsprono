const sequelize = require('../../database')
const User = require('./User')
const Role = require('./Role')
const UserRole = require('./UserRole')
const Team = require('./Team')
const League = require('./League')

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' })
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' })
League.hasMany(Team, { foreignKey: 'leagueId' });
Team.belongsTo(League, { foreignKey: 'leagueId' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  League,
  Team
};
