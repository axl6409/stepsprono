const axios = require("axios");
const { Season } = require("../models");
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

module.exports = {
  updateSeasons,
  getCurrentSeasonId,
  getCurrentSeasonYear,
};