const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

async function getAPICallsCount() {
  try {
    const options = {
      method: 'GET',
      url: `${apiBaseUrl}status/`,
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const requests = response.data;
    return requests;
  } catch (error) {
    console.log('Erreur lors de la récupération des appels API : ', error);
  }
}

module.exports = {
  getAPICallsCount,
};