const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

async function getCompetitionsByCountry(country = 'fr') {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + '/leagues',
      params: {
        code: country,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    }
    const response = await axios.request(options);
    return response.data.response
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

module.exports = {
  getCompetitionsByCountry
}