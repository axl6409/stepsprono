const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

async function updateLeagues(country = 'france') {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + '/leagues',
      params: {
        country: country,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    }
    const response = await axios.request(options);
    const seasons = response.data.response
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

module.exports = {
  updateLeagues,
};