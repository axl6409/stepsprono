const { Season } = require("../../models");
const logger = require("../../utils/logger/logger");

/**
 * Asynchronously retrieves the ID of the current season for a given competition.
 *
 * @param {number} competitionId - The ID of the competition.
 * @return {Promise<string|undefined>} The ID of the current season, or "Please provide a competition id" if no competition ID is provided. If an error occurs during the retrieval process, it logs an error message.
 */
const getCurrentSeasonId = async (competitionId) => {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competition_id: competitionId,
        current: true,
      }
    });
    return currentSeason.id;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

/**
 * Retrieves the year of the current season for a given competition ID.
 *
 * @param {number} competitionId - The ID of the competition.
 * @return {Promise<string>} The year of the current season, or an error message if the competition ID is not provided.
 */
const getCurrentSeasonYear = async (competitionId) => {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competition_id: competitionId,
        current: true,
      }
    });
    return currentSeason.year;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

module.exports = {
  getCurrentSeasonId,
  getCurrentSeasonYear,
}