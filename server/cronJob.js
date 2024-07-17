const cron = require('node-cron')
const eventBus = require('./src/events/eventBus')
const moment = require("moment");
const { createOrUpdateTeams, updateTeamStats } = require('./src/services/teamService')
const { updateMatchStatusAndPredictions } = require('./src/services/matchService')
const { checkupBets } = require('./src/services/betService')
const { updatePlayers } = require('./src/controllers/playerController')
const { checkAndScheduleSeasonEndTasks } = require("./src/services/appService");
const { updateMatches, fetchWeekMatches } = require('./src/services/matchService');
const logger = require("./src/utils/logger/logger");

const runCronJob = () => {
  cron.schedule('01 00 * * 0', () => {
    eventBus.emit('weekEnded');
  })
  cron.schedule('0 0 * * *', () => {
    const tomorrow = moment().add(1, 'days')
    if (tomorrow.date() === 1) {
      eventBus.emit('monthEnded');
    }
    fetchWeekMatches().then(r => {
      logger.info('Week Matches Fetched : Success');
    })
    checkAndScheduleSeasonEndTasks().then(r => {
      logger.info('Season Rewards : Success');
    })
  })
  cron.schedule('01 00 * * *', updateTeamStats)
  cron.schedule('01 00 * * *', updateMatches)
}

module.exports = { runCronJob, createOrUpdateTeams, updateTeamStats, updateMatches, fetchWeekMatches, updateMatchStatusAndPredictions, updatePlayers, checkupBets };