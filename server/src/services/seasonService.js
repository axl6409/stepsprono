const axios = require("axios");
const { Season } = require("../models");
const logger = require("../utils/logger/logger");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

async function updateSeasons() {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + '/seasons',
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

async function getCurrentSeasonId(competitionId = null) {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competitionId: competitionId,
        current: true,
      }
    });
    return currentSeason.id;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

async function getCurrentSeasonYear(competitionId = null) {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competitionId: competitionId,
        current: true,
      }
    });
    return currentSeason.year;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

async function checkAndAddNewSeason(competitionId) {
  try {
    const lastSeasonYear = await getCurrentSeasonYear(competitionId);
    const newYearChecked = lastSeasonYear + 1
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'leagues',
      params: {
        team: `${competitionId}`,
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
        startDate: nextSeason.start,
        endDate: nextSeason.end,
        competitionId: competitionId,
        winnerId: null,
        current: nextSeason.current,
        currentMatchday: 1,
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


module.exports = {
  updateSeasons,
  getCurrentSeasonId,
  getCurrentSeasonYear,
  checkAndAddNewSeason,
};