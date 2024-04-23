const axios = require("axios");
const moment = require("moment-timezone");
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
    return response.data;
  } catch (error) {
    console.log('Erreur lors de la récupération des appels API : ', error);
  }
}

function getMonthDateRange() {
  const moment = require('moment');
  const start = moment().startOf('month');
  const end = moment().endOf('month');
  return { start: start, end: end };
}

module.exports = {
  getAPICallsCount,
  getMonthDateRange
};