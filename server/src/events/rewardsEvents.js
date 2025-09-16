const eventBus = require('./eventBus');
const logger = require('../utils/logger/logger');
const {
  checkMassacreTrophy, checkChallengerTrophy, checkKhalassTrophy, checkSeasonRewards, checkOracleTrophy,
  checkBlackCatTrophy, checkZeroGuardianTrophy, checkLooserTrophy, checkJackpotTrophy, checkInvincibleTrophy,
  checkPhoenixTrophy, checkFragileTrophy, checkTripleLooserTrophy, checkTripleMenaceTrophy, checkNomadeTrophy,
  checkCasanierTrophy, checkVisionaryTrophy, checkAnalystTrophy, checkRisingStarTrophy, checkGhostTrophy,
  checkBlindTrophy, checkFavoriteTrophy, checkEternalSecondTrophy, checkHeartExpertTrophy, checkFanaticTrophy,
  checkGoalDetectiveTrophy, checkCollectorTrophy, checkKingStepsTrophy, checkJesterTrophy, checkLegendaryStepTrophy,
  checkMilestoneTrophies
} = require("../services/rewardService");
const {checkSpecialRule} = require("../services/specialRuleService");

eventBus.on('betsClosed', async () => {
  logger.info('# Event => betsClosed || Rewards check begins #');
  logger.info('Début de la vérification du trophée Nomade');
  await checkCasanierTrophy()
  logger.info('Vérification du trophée Nomade terminée');
  logger.info('Début de la vérification du trophée Nomade');
  await checkNomadeTrophy()
  logger.info('Vérification du trophée Nomade terminée');
  logger.info('Début de la vérification du trophée Ghost');
  await checkGhostTrophy()
  logger.info('Vérification du trophée Ghost terminée');
  logger.info('# Event => betsClosed || Rewards check ends #');
})

eventBus.on('weekEnded', async () => {
  logger.info('# Event => weekEnded || Special Rules check begins #');
  logger.info('Début de la vérification des règle spéciales');
  await checkSpecialRule()
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

eventBus.on('betsChecked', async (matchId) => {
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
  logger.info('Début de la vérification du trophée TripleMenace');
  await checkTripleMenaceTrophy()
  logger.info('Vérification du trophée TripleLooser terminée');
  logger.info('Début de la vérification du trophée TripleMenace');
  await checkTripleLooserTrophy()
  logger.info('Vérification du trophée TripleLooser terminée');
  logger.info('Début de la vérification du trophée Visionary');
  await checkVisionaryTrophy()
  logger.info('Vérification du trophée Visionary terminée');
  logger.info('Début de la vérification du trophée Blind');
  await checkBlindTrophy()
  logger.info('Vérification du trophée Blind terminée');
  logger.info('Début de la vérification du trophée Analyst');
  await checkAnalystTrophy()
  logger.info('Vérification du trophée Analyst terminée');
  logger.info('Début de la vérification du trophée HeartExpert');
  await checkHeartExpertTrophy()
  logger.info('Vérification du trophée HeartExpert terminée');
  logger.info('Début de la vérification du trophée Fanatic');
  await checkFanaticTrophy()
  logger.info('Vérification du trophée Fanatic terminée');
  logger.info('Début de la vérification du trophée GoalDetective');
  await checkGoalDetectiveTrophy()
  logger.info('Vérification du trophée GoalDetective terminée');
  logger.info('Début de la vérification du trophée Milestone');
  await checkMilestoneTrophies();
  logger.info('Vérification du trophée Milestone terminée');
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
  logger.info('Début de la vérification du trophée Favorite');
  await checkFavoriteTrophy();
  logger.info('Vérification du trophée Favorite terminée');
  logger.info('Début de la vérification du trophée EternalSecond');
  await checkEternalSecondTrophy();
  logger.info('Vérification du trophée EternalSecond terminée');
  logger.info('# Event => monthEnded || Rewards check ends #');
})

eventBus.on('seasonEnded', async () => {
  logger.info('# Event => rewardEarned || Rewards check begins #');
  logger.info('Season rewards check begins')
  await checkSeasonRewards()
  logger.info('Season rewards check ends')
  logger.info('Début de la vérification du trophée KingSteps');
  await checkKingStepsTrophy();
  logger.info('Vérification du trophée KingSteps terminée');
  logger.info('Début de la vérification du trophée Jester');
  await checkJesterTrophy();
  logger.info('Vérification du trophée Jester terminée');
  logger.info('Début de la vérification du trophée LegendaryStep');
  await checkLegendaryStepTrophy();
  logger.info('Vérification du trophée LegendaryStep terminée');
  logger.info('# Event => rewardEarned || Rewards check ends #');
})

eventBus.on('rewardEarned', async () => {
  logger.info('# Event => rewardEarned || Rewards check begins #');
  logger.info('Début de la vérification du trophée EternalSecond');
  await checkCollectorTrophy();
  logger.info('Vérification du trophée EternalSecond terminée');
  logger.info('# Event => rewardEarned || Rewards check ends #');
})

eventBus.on('betsReceiptEnded', (userId) => {
  logger.info('Bets receipt ended')
})

eventBus.on('firstMonthEnded', async () => {
  logger.info('Début de la vérification du trophée L\'Étoile Montante');
  await checkRisingStarTrophy();
  logger.info('Vérification du trophée L\'Étoile Montante terminée');
});

module.exports = {};
