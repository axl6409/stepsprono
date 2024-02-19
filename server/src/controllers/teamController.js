const axios = require("axios");
const { Team, TeamCompetition } = require("../models");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const { downloadImage } = require('../services/imageService');
const { calculatePoints } = require("../services/betService");
const { getCurrentSeasonId, getCurrentSeasonYear } = require("./seasonController");

async function createOrUpdateTeams(teamID = null, season = null, competitionId = null, includeStats = false, onlyUpdateStats = false) {
  try {
    let teams = [];
    if (!onlyUpdateStats) {
      if (!season) {
        console.log('Please provide a season number');
        return 'Please provide a season number'
      }
      if (!competitionId) {
        console.log('Please provide a competition id');
        return 'Please provide a competition id'
      }
      const teamInfosOptions = {
        method: 'GET',
        url: apiBaseUrl + 'teams',
        params: {
          ...(teamID && { id: teamID }),
          league: competitionId,
          season: season
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
      } else {
        const existingTeams = await Team.findAll();
        if (existingTeams) {
          existingTeams.forEach(team => teams.push({team: team}));
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

      const seasonId = await getCurrentSeasonId(competitionId)
      const seasonYear = await getCurrentSeasonYear(competitionId)

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
        } else {
          await updateTeamStats(competitionId, team.team.id, seasonYear, seasonId)
        }
      } else {
        await updateTeamStats(competitionId, team.team.id, seasonYear, seasonId)
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des équipes: ', error);
  }
}

async function updateTeamStats(competitionId = null, teamID = null, seasonYear = null, seasonId = null) {
  try {
    if (!seasonYear) {
      console.log('Please provide a season number');
      return 'Please provide a season number'
    }
    if (!seasonId) {
      console.log('Please provide a season id');
      return 'Please provide a season id'
    }
    if (!competitionId) {
      console.log('Please provide a competition id');
      return 'Please provide a competition id'
    }
    if (!teamID) {
      console.log('Please provide a team id');
      return 'Please provide a team id'
    }
    const teamStatsOptions = {
      method: 'GET',
      url: apiBaseUrl + 'teams/statistics',
      params: {
        league: competitionId,
        season: seasonYear,
        team: teamID
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const statsResponse = await axios.request(teamStatsOptions);
    const stats = statsResponse.data.response;

    await TeamCompetition.upsert({
      teamId: teamID || team.team.id,
      competitionId: stats.league.id,
      seasonId: seasonId,
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
      points: calculatePoints(stats.fixtures.wins.total, stats.fixtures.draws.total, stats.fixtures.loses.total),
      goalsFor: stats.goals.for.total.total,
      goalsAgainst: stats.goals.against.total.total,
      goalDifference: stats.goals.for.total.total - stats.goals.against.total.total
    });
  } catch (error) {
    console.log('Erreur lors de la mise à jour des statistiques: ', error);
  }
}

async function updateTeamsRanking(teamId = null, competitionId = null) {
  try {
    const seasonId = await getCurrentSeasonId(competitionId)
    const seasonYear = await getCurrentSeasonYear(competitionId)
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'standings',
      params: {
        season: seasonYear,
        league: competitionId
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
        await TeamCompetition.update({
          position: teamToUpdate.rank,
        }, {
          where: {
            teamId: teamId,
            seasonId: seasonId,
            competitionId: competitionId,
          }
        });
      }
    } else {
      for (const team of teams) {
        console.log(team.team.id, team.rank);
        await TeamCompetition.update({
          position: team.rank,
        }, {
          where: {
            teamId: team.team.id,
            seasonId: seasonId,
            competitionId: competitionId,
          }
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