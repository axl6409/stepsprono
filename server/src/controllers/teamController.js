const axios = require("axios");
const { Team} = require("../models");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const { downloadImage } = require('../services/imageService');
const { calculatePoints } = require("../services/betService");

async function createOrUpdateTeams(teamID = null, includeStats = false, onlyUpdateStats = false) {
  try {
    let teams = [];
    if (!onlyUpdateStats) {
      const teamInfosOptions = {
        method: 'GET',
        url: apiBaseUrl + 'teams',
        params: {
          ...(teamID && { id: teamID }),
          league: '61',
          season: '2023'
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      };
      const teamResponse = await axios.request(teamInfosOptions);
      teams = teamResponse.data.response || [];
    } else {
      if (teamID) {
        const existingTeam = await Team.findByPk(teamID);
        if (existingTeam) {
          teams.push({team: existingTeam});
        }
      }
    }

    for (const team of teams) {
      let logoUrl, venueImageUrl;
      if (!onlyUpdateStats) {
        const existingTeam = await Team.findByPk(team.team.id);
        logoUrl = existingTeam?.logoUrl;
        venueImageUrl = existingTeam?.venueImage;
        if (!logoUrl && team.team.logo) {
          logoUrl = await downloadImage(team.team.logo, team.team.id, 'logo');
        }
        if (!venueImageUrl && team.venue.image) {
          venueImageUrl = await downloadImage(team.venue.image, team.team.id, 'venue');
        }
      }

      if (!includeStats) {
        if (!onlyUpdateStats) {
          await Team.upsert({
            id: team.team.id,
            name: team.team.name,
            code: team.team.code,
            logoUrl: logoUrl,
            venueName: team.venue.name,
            venueAddress: team.venue.address,
            venueCity: team.venue.city,
            venueCapacity: team.venue.capacity,
            venueImage: venueImageUrl,
          });
        }
      } else {
        const teamStatsOptions = {
          method: 'GET',
          url: apiBaseUrl + 'teams/statistics',
          params: {
            league: '61',
            season: '2023',
            team: teamID || team.team.id
          },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        };
        const statsResponse = await axios.request(teamStatsOptions);
        const stats = statsResponse.data.response;

        await Team.upsert({
          id: teamID || team.team.id,
          ...(onlyUpdateStats ? {} : {
            name: team.team.name,
            code: team.team.code,
            logoUrl: logoUrl,
            venueName: team.venue.name,
            venueAddress: team.venue.address,
            venueCity: team.venue.city,
            venueCapacity: team.venue.capacity,
            venueImage: venueImageUrl,
          }),
          competitionId: stats.league.id,
          playedTotal: stats.fixtures.played.total,
          playedHome: stats.fixtures.played.home,
          playedAway: stats.fixtures.played.away,
          winTotal: stats.fixtures.wins.total,
          winHome: stats.fixtures.wins.home,
          winAway: stats.fixtures.wins.away,
          drawTotal: stats.fixtures.draws.total,
          drawHome: stats.fixtures.draws.home,
          drawAway: stats.fixtures.draws.away,
          losesTotal: stats.fixtures.loses.total,
          losesHome: stats.fixtures.loses.home,
          losesAway: stats.fixtures.loses.away,
          form: stats.form,
          points: calculatePoints(stats.fixtures.wins.total, stats.fixtures.draws.total, stats.fixitures.loses.total),
          goalsFor: stats.goals.for.total.total,
          goalsAgainst: stats.goals.against.total.total,
          goalDifference: stats.goals.for.total.total - stats.goals.against.total.total
        });
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

async function updateTeamsRanking(teamId = null) {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'standings',
      params: {
        season: '2023',
        league: '61'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const teams = response.data.response[0].league.standings[0];

    if (teamId) {
      const teamToUpdate = teams.find(team => team.team.id === teamId);
      if (teamToUpdate) {
        await Team.update({
          position: teamToUpdate.rank,
        }, {
          where: { id: teamId }
        });
      }
    } else {
      for (const team of teams) {
        await Team.update({
          position: team.rank,
        }, {
          where: { id: team.team.id }
        });
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

module.exports = {
  createOrUpdateTeams,
  updateTeamsRanking,
};