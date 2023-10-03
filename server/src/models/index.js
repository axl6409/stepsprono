const sequelize = require('../../database')
const User = require('./User')
const Role = require('./Role')
const UserRole = require('./UserRole')
const Team = require('./Team')
const League = require('./League')
const Match = require('./Match')
const Bets = require('./Bets')

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' })
User.hasMany(Bets, { foreignKey: 'userId' })
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' })
League.hasMany(Team, { foreignKey: 'leagueId' });
Team.belongsTo(League, { foreignKey: 'leagueId' });
Team.hasMany(Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
Team.hasMany(Match, { as: 'awayMatches', foreignKey: 'awayTeamId' });
Team.hasMany(Bets, { foreignKey: 'winnerId' });
Match.belongsTo(Team, { as: 'HomeTeam', foreignKey: 'homeTeamId' });
Match.belongsTo(Team, { as: 'AwayTeam', foreignKey: 'awayTeamId' });
Match.hasMany(Bets, { foreignKey: 'matchId' });
Bets.belongsTo(User, { foreignKey: 'userId' });
Bets.belongsTo(Match, { foreignKey: 'matchId' });
Bets.belongsTo(Team, { foreignKey: 'winnerId' });

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  League,
  Team,
  Match,
  Bets,
};
