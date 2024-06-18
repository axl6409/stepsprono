// server/src/services/seasonService.js
const axios = require("axios");
const { Season } = require("../models");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/**
 * Updates seasons by fetching data from an external API and upserting them into the database.
 */
async function updateSeasons() {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + '/seasons',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const seasons = response.data.response;

    for (const season of seasons) {
      await Season.upsert({
        id: season.id,
        name: season.name,
        startDate: season.start,
        endDate: season.end,
        current: season.current,
        competitionId: season.competition_id
      });
    }

    console.log('Mise à jour des saisons effectuée avec succès');
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

/**
 * Retrieves the current season ID based on the provided competition ID.
 *
 * @param {number} competitionId - The ID of the competition (default: null if not provided)
 * @return {number} The ID of the current season if found, otherwise null
 */
async function getCurrentSeasonId(competitionId = null) {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competitionId: competitionId,
        current: true,
      }
    });
    return currentSeason ? currentSeason.id : null;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

/**
 * Retrieves the current season year based on the provided competition ID.
 *
 * @param {number} competitionId - The ID of the competition (default: null if not provided)
 * @return {number} The year of the current season if found, otherwise null
 */
async function getCurrentSeasonYear(competitionId = null) {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competitionId: competitionId,
        current: true,
      }
    });
    return currentSeason ? currentSeason.year : null;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

module.exports = {
  updateSeasons,
  getCurrentSeasonId,
  getCurrentSeasonYear,
};
