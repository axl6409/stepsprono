const cron = require('node-cron')
const eventBus = require('./src/events/eventBus')
const moment = require("moment");
const { updatePlayers } = require('./src/services/playerService')
const { checkAndScheduleSeasonEndTasks, scheduleBetsCloseEvent} = require("./src/services/appService");
const { fetchAndProgramWeekMatches, fetchWeekMatches} = require('./src/services/matchService');
const logger = require("./src/utils/logger/logger");
const {getAllTeams} = require("./src/services/teamService");
const {sendNotificationsToAll} = require("./src/services/fcmService");
const {betsCloseNotification} = require("./src/services/notificationService");

async function updatePlayersForAllTeamsSequentially(teams) {
  for (let i = 0; i < teams.length; i++) {
    await new Promise(resolve => setTimeout(resolve, i * 60000));
    logger.info(`Updating players for team ${teams[i].name} (ID: ${teams[i].id})`);
    await updatePlayers(teams[i].id);
    logger.info(`Players updated for team ${teams[i].name} (ID: ${teams[i].id})`);
  }
}

const runCronJob = () => {

  // Every day at 00:01
  cron.schedule('0 1 * * *', async () => {
    console.log('Exécution de la tâche cron à 1h du matin...');
    await betsCloseNotification();
  });

  // Every Sunday at 23:59
  cron.schedule('59 23 * * 0', () => {
    logger.info("[CRON]=> 59 23 * * 0 => eventBus.emit('weekEnded')")
    eventBus.emit('weekEnded');
  })

  // Every monday at 0:00
  cron.schedule('0 0 * * 1', async () => {
    logger.info('[CRON]=> 0 0 * * 1 => fetchAndProgramWeekMatches()');
    await fetchAndProgramWeekMatches().then(r => {
      logger.info('Week Matches Fetched : Success');
    })
    await scheduleBetsCloseEvent().then(r => {
      logger.info('Program bets closed : Success');
    })
  })

  // Every day at 23:30
  cron.schedule('30 23 * * *', async () => {
    logger.info("[CRON]=> 30 23 * * * => eventBus.emit('monthEnded')");
    const tomorrow = moment().add(1, 'days')
    if (tomorrow.date() === 1) {
      eventBus.emit('monthEnded');
    }
  })

  // Mercato Winters at 23:00 on day-of-month 5 in February.
  cron.schedule('00 23 5 2 *', async () => {
    logger.info('Mercato winter update started');
    try {
      const teams = await getAllTeams();
      await updatePlayersForAllTeamsSequentially(teams);
      logger.info('All players updated successfully');
    } catch (error) {
      logger.error('Error updating players:', error);
    }
    logger.info('Mercato winter update ended');
  })

  // Mercato Summer at 23:00 on day-of-month 2 in June.
  cron.schedule('00 23 2 9 *', async () => {
    logger.info('Mercato summer update started');
    try {
      const teams = await getAllTeams();
      await updatePlayersForAllTeamsSequentially(teams);
      logger.info('All players updated successfully');
    } catch (error) {
      logger.error('Error updating players:', error);
    }
    logger.info('Mercato summer update ended');
  });

  // At 23:59 on day-of-month 1 in September.
  cron.schedule('00 00 01 8 *', async () => {
    logger.info('Émission de l\'événement firstMonthEnded');
    eventBus.emit('firstMonthEnded');
    await checkAndScheduleSeasonEndTasks().then(r => {
      logger.info('Season Rewards : Success');
    })
  });
}

module.exports = {
  runCronJob,
};