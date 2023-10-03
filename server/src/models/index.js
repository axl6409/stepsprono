const sequelize = require('../../database')
const User = require('./User')
const Role = require('./Role')
const UserRole = require('./UserRole')
const Team = require('./Team')
const League = require('./League')
const Match = require('./Match')

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' })
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' })
League.hasMany(Team, { foreignKey: 'leagueId' });
Team.belongsTo(League, { foreignKey: 'leagueId' });
Team.hasMany(Match, { foreignKey: 'homeTeamId' });
Team.hasMany(Match, { foreignKey: 'awayTeamId' });
Match.belongsTo(Team, { as: 'HomeTeam', foreignKey: 'homeTeamId' });
Match.belongsTo(Team, { as: 'AwayTeam', foreignKey: 'awayTeamId' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  League,
  Team,
  Match,
};
