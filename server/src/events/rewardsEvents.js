// predictionEvents.js
const eventBus = require('./eventBus');
const rewardService = require('../services/rewardService');
const logger = require('../utils/logger/logger');

eventBus.on('weekEnded', () => {
  logger.info('Week ended')
  rewardService.checkWeeklyChampion().then(r => {
    logger.info('Weekly champion checked')
  })
})
eventBus.on('matchUpdated', (matchId, userId) => {
  logger.info('Match updated', matchId, userId)
  rewardService.checkDailyRewards(matchId, userId);
});
eventBus.on('monthEnded', () => {
  logger.info('Monthly rewards check begins')
  rewardService.checkMonthlyRewards()
})
eventBus.on('seasonRewards', () => {
  logger.info('Season rewards check begins')

})
eventBus.on('betsReceiptEnded', (userId) => {
  logger.info('Bets receipt ended')
})

module.exports = {};
