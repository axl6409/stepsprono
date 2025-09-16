const { getCurrentMatchday } = require("../matchdayService");
const { getMatchdayRanking } = require("../betService");
const logger = require("../../utils/logger/logger");

/**
 * Récupère le classement de la journée en cours
 * @returns {Promise<Array>} Un tableau des utilisateurs avec leurs points pour la journée en cours
 */
const getCurrentMatchdayRanking = async () => {
  try {
    const currentMatchday = await getCurrentMatchday();
    const ranking = await getMatchdayRanking(currentMatchday);
    
    // Vérifie si tous les utilisateurs ont 0 point
    const allPoints = ranking.map(user => user.points);
    const allAreZero = allPoints.every(points => points === 0);
    
    if (allAreZero) {
      logger.info(`Tous les utilisateurs ont 0 point pour la journée ${currentMatchday}.`);
    }
    
    return ranking;
  } catch (error) {
    logger.error('Erreur lors de la récupération du classement de la journée en cours :', error);
    throw error;
  }
};

module.exports = {
  getCurrentMatchdayRanking
};