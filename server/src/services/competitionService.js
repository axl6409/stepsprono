// server/src/services/competitionService.js
const axios = require('axios');
const { Competition } = require('../models');
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/**
 * Retrieves competitions for a specific country code.
 *
 * @param {string} countryCode - The country code to retrieve competitions for.
 * @return {Array} An array of competitions data for the specified country.
 */
exports.getCompetitionsByCountry = async (countryCode) => {
  try {
    const options = {
      method: 'GET',
      url: `${apiBaseUrl}/competitions`,
      params: { code: countryCode },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    };
    const response = await axios.request(options);
    return response.data.competitions;
  } catch (error) {
    console.log('Erreur lors de la récupération des compétitions par pays:', error);
    throw new Error('Erreur lors de la récupération des compétitions');
  }
};
