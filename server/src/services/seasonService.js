const axios = require("axios");
const { Season } = require("../models");
const logger = require("../utils/logger/logger");
const {getCurrentCompetitionId} = require("./competitionService");
const {getCurrentSeasonId} = require("./logic/seasonLogic")
const {getCurrentMatchday} = require("./matchdayService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/**
 * Retrieves the current season from the database.
 *
 * @return {Promise<Season>} A Promise that resolves to the current season object.
 */
const getCurrentSeason = async () => {
  return await Season.findOne({
    where: {
      current: true,
    }
  });
}

/**
 * Asynchronously updates the seasons by making a GET request to the API endpoint '/seasons'.
 *
 * @return {Promise<void>} A Promise that resolves when the seasons are successfully updated, or rejects with an error if there was an issue.
 */
const updateSeasons = async () => {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + '/seasons',
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

const getCurrentSeasonDatas = async (competitionId) => {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competition_id: competitionId,
        current: true,
      }
    });
    return currentSeason;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}


/**
 * Retrieves the start and end dates of a season based on the provided season year.
 *
 * @param {number} seasonYear - The year of the season.
 * @return {Promise<{startDate: string, endDate: string}>} An object containing the start and end dates of the season.
 * @throws {Error} If the season is not found for the provided season year.
 */
const getSeasonDates = async (seasonYear) => {
  const season = await Season.findOne({
    where: {
      year: seasonYear
    },
    attributes: ['start_date', 'end_date']
  });

  if (!season) {
    throw new Error(`Saison introuvable pour l'année ${seasonYear}`);
  }

  return {
    startDate: season.start_date,
    endDate: season.end_date
  };
};

/**
 * Checks if a new season is available for a given competition and adds it if it is.
 *
 * @param {number} competitionId - The ID of the competition to check for a new season.
 * @return {Promise<{message: string}>} An object with a message indicating whether a new season was added or not.
 * @throws {Error} If there was an error checking for a new season.
 */
const checkAndAddNewSeason = async (competitionId) => {
  try {
    const lastSeasonYear = await getCurrentSeasonYear(competitionId);
    const newYearChecked = lastSeasonYear + 1
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'leagues',
      params: {
        id: `${competitionId}`,
        season: newYearChecked,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const seasons = response.data;
    const available = seasons.results > 0;
    if (available) {
      const nextSeason = seasons.response[0].seasons[0]
      await Season.create({
        year: nextSeason.year,
        start_date: nextSeason.start,
        end_date: nextSeason.end,
        competition_id: competitionId,
        winner_id: null,
        current: nextSeason.current,
        current_matchday: 1,
        scheduled: false,
      });
      return { message: 'Nouvelle saison ajoutée avec succès.' };
    } else {
      return { message: 'Aucune nouvelle saison disponible.' };
    }
  } catch (error) {
    logger.error('checkAndAddNewSeason ERROR: ', error);
    throw new Error('Erreur lors de la vérification de la nouvelle saison');
  }
}

const updateSeasonMatchday = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
    const currentMatchday = await getCurrentMatchday();
    if (currentMatchday === null) {
      logger.info('[updateSeasonMatchday] No matchs this week | current matchday === null');
      return;
    }
    await Season.update({
      current_matchday: currentMatchday,
    }, {
      where: {
        id: seasonId,
        current: true,
      },
    });
  } catch (error) {
    logger.error('[updateSeasonMatchday] : ', error);
    throw new Error('Erreur lors de la vérification de la nouvelle saison');
  }
}

module.exports = {
  getCurrentSeason,
  updateSeasons,
  getCurrentSeasonDatas,
  checkAndAddNewSeason,
  getSeasonDates,
  updateSeasonMatchday,
};