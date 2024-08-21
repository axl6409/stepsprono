const eventBus = require('./eventBus');
const rewardService = require('../services/rewardService');
const logger = require('../utils/logger/logger');
const {
  checkMassacreTrophy, checkChallengerTrophy, checkKhalassTrophy, checkSeasonRewards, checkOracleTrophy,
  checkBlackCatTrophy, checkZeroGuardianTrophy, checkLooserTrophy, checkJackpotTrophy, checkInvincibleTrophy,
  checkPhoenixTrophy, checkFragileTrophy
} = require("../services/rewardService");

eventBus.on('weekEnded', async () => {
  logger.info('# Event => weekEnded || Rewards check begins #');
  logger.info('Début de la vérification du trophée Massacre');
  await checkMassacreTrophy()
  logger.info('Vérification du trophée Massacre terminée');
  logger.info('Début de la vérification du trophée Khalass');
  await checkKhalassTrophy()
  logger.info('Vérification du trophée Khalass terminée');
  logger.info('Début de la vérification du trophée Challenger');
  await checkChallengerTrophy()
  logger.info('Vérification du trophée Challenger terminée');
  logger.info('Début de la vérification du trophée Oracle');
  await checkOracleTrophy()
  logger.info('Vérification du trophée Oracle terminée');
  logger.info('Début de la vérification du trophée checkBlackCatTrophy');
  await checkBlackCatTrophy()
  logger.info('Vérification du trophée BlackCat terminée');
  logger.info('# Event => weekEnded || Rewards check ends #');
})
eventBus.on('lastMatchWeekUpdated', async () => {
  logger.info('Last match week updated')
})
eventBus.on('matchUpdated', async (matchId) => {
  logger.info('# Event => matchUpdated || Rewards check begins #');
  logger.info('Match updated', matchId)
  logger.info('Début de la vérification du trophée ZeroGuardian');
  await checkZeroGuardianTrophy()
  logger.info('Vérification du trophée ZeroGuardian terminée');
  logger.info('Début de la vérification du trophée Jackpot');
  await checkJackpotTrophy()
  logger.info('Vérification du trophée Jackpot terminée');
  logger.info('Début de la vérification du trophée Looser');
  await checkLooserTrophy()
  logger.info('Vérification du trophée Looser terminée');
  logger.info('# Event => matchUpdated || Rewards check ends #');
});
eventBus.on('monthEnded', async () => {
  logger.info('# Event => monthEnded || Rewards check begins #');
  logger.info('Début de la vérification du trophée Invincible');
  await checkInvincibleTrophy()
  logger.info('Vérification du trophée Invincible terminée');
  logger.info('Début de la vérification du trophée Fragile');
  await checkFragileTrophy()
  logger.info('Vérification du trophée Fragile terminée');
  logger.info('Début de la vérification des trophées mensuels');
  await checkPhoenixTrophy();
  logger.info('Vérification des trophées mensuels terminée');
  logger.info('# Event => monthEnded || Rewards check ends #');
})
eventBus.on('seasonRewards', () => {
  logger.info('Season rewards check begins')
})
eventBus.on('seasonEnded', async () => {
  logger.info('# Season ended #')
  logger.info('Season rewards check begins')
  await checkSeasonRewards()
  logger.info('Season rewards check ends')

})
eventBus.on('betsReceiptEnded', (userId) => {
  logger.info('Bets receipt ended')
})

eventBus.on('firstMonthEnded', async () => {
  logger.info('Début de la vérification du trophée L\'Étoile Montante');
  await rewardService.checkRisingStarTrophy();
  logger.info('Vérification du trophée L\'Étoile Montante terminée');
});

module.exports = {};
