// predictionEvents.js
const eventBus = require('./eventBus');
const rewardService = require('../services/rewardService');
const logger = require('../utils/logger/logger');

eventBus.on('matchUpdated', (matchId, userId) => {
  console.log('Les matchs ont été mis à jour', matchId);
  rewardService.checkRewards(matchId, userId);
});
eventBus.on('monthlyRewards', () => {
  logger.info('Monthly rewards check begins')
  rewardService.checkMonthlyRewards()
})
eventBus.on('seasonRewards', () => {
  logger.info('Season rewards check begins')

})
eventBus.on('betsReceiptEnded', (userId) => {
  logger.info('Bets receipt ended')
  rewardService.checkBetsReceipt(null, userId)
})

module.exports = {};
