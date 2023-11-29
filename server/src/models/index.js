const sequelize = require('../../database')
const User = require('./User')
const Role = require('./Role')
const UserRole = require('./UserRole')
const Team = require('./Team')
const Players = require('./Players')
const Match = require('./Match')
const Bets = require('./Bets')
const Area = require('./Area')
const Competition = require('./Competition')
const Season = require('./Season')
const Settings = require('./Settings')

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' })
User.hasMany(Bets, { foreignKey: 'userId' })
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' })
Team.hasMany(Match, { as: 'homeMatches', foreignKey: 'homeTeamId' })
Team.hasMany(Match, { as: 'awayMatches', foreignKey: 'awayTeamId' })
Team.hasMany(Bets, { foreignKey: 'winnerId' })
Players.belongsTo(Team, { as: 'Team', foreignKey: 'teamId' })
Match.belongsTo(Team, { as: 'HomeTeam', foreignKey: 'homeTeamId' })
Match.belongsTo(Team, { as: 'AwayTeam', foreignKey: 'awayTeamId' })
Match.hasMany(Bets, { foreignKey: 'matchId' })
Bets.belongsTo(User, { foreignKey: 'userId' })
Bets.belongsTo(Match, { foreignKey: 'matchId' })
Bets.belongsTo(Team, { foreignKey: 'winnerId' })
Bets.belongsTo(Players, { foreignKey: 'playerGoal' })

module.exports = {
  sequelize,
  User,
  Role,
  UserRole,
  Area,
  Competition,
  Season,
  Team,
  Players,
  Match,
  Bets,
  Settings,
};
