// predictionEvents.js
const eventBus = require('./eventBus');
const rewardService = require('../services/rewardService');
const logger = require('../utils/logger/logger');

eventBus.on('weekEnded', () => {
  logger.info('Week ended')
})
eventBus.on('matchUpdated', (matchId, userId) => {
  logger.info('Match updated', matchId, userId)
});
eventBus.on('monthEnded', () => {
  logger.info('Monthly rewards check begins')
})
eventBus.on('seasonRewards', () => {
  logger.info('Season rewards check begins')
})
eventBus.on('betsReceiptEnded', (userId) => {
  logger.info('Bets receipt ended')
})
eventBus.on('monthEnded', async () => {
  console.log('Verification des trophées mensuels');
  logger.info('Début de la vérification des trophées mensuels');
  await rewardService.checkPhoenixTrophy();
  logger.info('Vérification des trophées mensuels terminée');
});

module.exports = {};
