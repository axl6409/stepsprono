const {Op} = require("sequelize");
const {Match} = require("../../models");
const logger = require("../../utils/logger/logger");

/**
 * Retrieves the matchdays within a given period of time.
 *
 * @param {Date} startDate - The start date of the period.
 * @param {Date} endDate - The end date of the period.
 * @return {Promise<number[]>} An array of matchdays within the given period.
 * @throws {Error} If the provided dates are invalid.
 */
const getPeriodMatchdays = async (startDate, endDate) => {
  try {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime()) || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error("Dates invalides fournies à getPeriodMatchdays");
    }

    const matchdays = new Set();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        status: 'FT'
      }
    })
    for (const match of matchs) {
      matchdays.add(match.matchday)
    }
    return Array.from(matchdays).map(Number);
  } catch (error) {
    console.log( 'Erreur lors de la récupération des matchs du mois courant:', error)
  }
}

const getMatchdayPeriod = async (matchday) => {
  try {
    if (isNaN(matchday)) {
      logger.error("Matchday invalide fourni à getMatchdayPeriod");
      throw new Error("Matchday invalide fourni à getMatchdayPeriod");
    }

    const matchs = await Match.findAll({
      where: {
        matchday: matchday,
      },
      order: [['utc_date', 'ASC']]
    });

    if (matchs.length === 0) {
      logger.info('Aucun match prévu pour le matchday', matchday);
      throw new Error(`Aucun match trouvé pour le matchday ${matchday}`);
    }

    const startDate = matchs[0].utc_date;
    const endDate = matchs[matchs.length - 1].utc_date;

    return {
      startDate,
      endDate
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des dates du matchday :', error);
    throw error;
  }
};

module.exports = {
  getPeriodMatchdays,
  getMatchdayPeriod
};