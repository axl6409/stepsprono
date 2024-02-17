const {Team, Player} = require("../models");
const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

async function updatePlayers(teamId) {
  try {
    let teams = [];
    if (teamId) {
      const team = await Team.findByPk(teamId)
      if (team) {
        teams = [team]
      }
    } else {
      teams = await Team.findAll()
    }
    for (const team of teams) {
      let currentPage = 1;
      let totalPages = 0;
      do {
        const options = {
          method: 'GET',
          url: `${apiBaseUrl}players/`,
          params: {
            team: `${team.id}`,
            season: '2023',
            page: currentPage
          },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        };
        const response = await axios.request(options);
        const apiMatchData = response.data.response;
        for (const apiPlayer of apiMatchData) {
          await Player.upsert({
            id: apiPlayer.player.id,
            name: apiPlayer.player.name,
            firstname: apiPlayer.player.firstname,
            lastname: apiPlayer.player.lastname,
            teamId: apiPlayer.statistics[0].team.id,
            photo: apiPlayer.player.photo
          })
        }
        totalPages = response.data.paging.total;
        currentPage++;
      } while (currentPage <= totalPages);
    }
  } catch (error) {
    console.log(`Erreur lors de le récupération des joueurs pour l'équipe ${teamId}:`, error);
  }
}

module.exports = {
  updatePlayers,
};