const axios = require("axios");
const { Season } = require("../models");
const logger = require("../utils/logger/logger");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

const getCurrentSeason = async () => {
  return await Season.findOne({
    where: {
      current: true,
    }
  });
}

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

async function getCurrentSeasonId(competitionId) {
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

async function getCurrentSeasonYear(competitionId) {
  try {
    if (!competitionId) return "Please provide a competition id";
    const currentSeason = await Season.findOne({
      where: {
        competition_id: competitionId,
        current: true,
      }
    });
    console.log(competitionId)
    return currentSeason.year;
  } catch (error) {
    console.log('Erreur lors de la récupération des données:', error);
  }
}

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


module.exports = {
  getCurrentSeason,
  updateSeasons,
  getCurrentSeasonId,
  getCurrentSeasonYear,
  checkAndAddNewSeason,
  getSeasonDates
};