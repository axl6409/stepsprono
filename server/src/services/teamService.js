const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {Team, TeamCompetition} = require("../models");
const {downloadImage} = require("./imageService");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService");
const logger = require("../utils/logger/logger");
const {calculatePoints} = require("./betService");

async function createOrUpdateTeams(teamIDs = [], season = null, competitionId = null, updateInfos = true, updateStats = true) {
  if (typeof teamIDs === 'number') {
    teamIDs = [teamIDs];
  }
  if (!season) {
    console.log('Please provide a season number');
    return 'Please provide a season number';
  }
  if (!competitionId) {
    console.log('Please provide a competition id');
    return 'Please provide a competition id';
  }
  try {
    let teams = [];
    if (updateInfos) {
      for (const teamID of teamIDs) {
        const teamInfosOptions = {
          method: 'GET',
          url: apiBaseUrl + 'teams',
          params: {
            id: teamID,
            season: season,
            league: competitionId
          },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        };
        const teamResponse = await axios.request(teamInfosOptions);
        if (teamResponse.data.results > 0) {
          const filteredTeams = teamResponse.data.response.map(team => ({
            id: team.team.id,
            name: team.team.name,
            code: team.team.code,
            logoUrl: team.team.logo,
            venueName: team.venue ? team.venue.name : null,
            venueAddress: team.venue ? team.venue.address : null,
            venueCity: team.venue ? team.venue.city : null,
            venueCapacity: team.venue ? team.venue.capacity : null,
            venueImage: team.venue && team.venue.image ? team.venue.image : null
          }));
          teams.push(...filteredTeams);
        }
      }
    } else {
      teams = await Team.findAll({
        where: teamIDs.length ? { id: teamIDs } : undefined,
      });
    }

    for (const team of teams) {
      let logoUrl = team.logoUrl;
      let venueImageUrl = team.venueImage;
      const existingTeam = await Team.findByPk(team.id);
      if (existingTeam) {
        logoUrl = existingTeam.logoUrl || logoUrl;
        venueImageUrl = existingTeam.venueImage || venueImageUrl;
      } else {
        if (team.logoUrl) {
          logoUrl = await downloadImage(team.logoUrl, team.id, 'logo');
        }
        if (team.venueImage) {
          venueImageUrl = await downloadImage(team.venueImage, team.id, 'venue');
        }
      }

      await Team.upsert({
        id: team.id,
        name: team.name,
        code: team.code,
        logoUrl: logoUrl,
        venueName: team.venueName ? team.venueName : null,
        venueAddress: team.venueAddress ? team.venueAddress : null,
        venueCity: team.venueCity ? team.venueCity : null,
        venueCapacity: team.venueCapacity ? team.venueCapacity : null,
        venueImage: venueImageUrl,
      });

      if (updateStats) {
        await updateTeamStats(competitionId, team.id, season);
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la création ou mise à jour des équipes: ', error);
  }
}

async function updateTeamStats(competitionId = null, teamID = null, seasonYear = null) {
  try {
    if (!seasonYear) {
      console.log('Please provide a season number');
      return 'Please provide a season number';
    }
    if (!competitionId) {
      console.log('Please provide a competition id');
      return 'Please provide a competition id';
    }
    const seasonId = await getCurrentSeasonId(competitionId);
    if (!seasonId || !competitionId || !teamID) {
      console.log('Missing required parameters');
      return 'Missing required parameters';
    }
    const teamStatsOptions = {
      method: 'GET',
      url: apiBaseUrl + 'standings',
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
    console.log("Stats => " + JSON.stringify(statsResponse));
    console.log("Stats JSON => " + JSON.stringify(stats));
    const [teamCompetition, created] = await TeamCompetition.findOrCreate({
      where: {
        teamId: teamID,
        competitionId: competitionId,
        seasonId: seasonId,
      },
      defaults: {
        teamId: teamID,
        competitionId: competitionId,
        seasonId: seasonId,
        form: stats.form,
        position: stats.rank,
        points: stats.points,
        playedTotal: stats.all.played,
        playedHome: stats.home.played,
        playedAway: stats.away.played,
        winTotal: stats.all.win,
        winHome: stats.home.win,
        winAway: stats.away.win,
        drawTotal: stats.all.draw,
        drawHome: stats.home.draw,
        drawAway: stats.away.draw,
        losesTotal: stats.all.lose,
        losesHome: stats.home.lose,
        losesAway: stats.away.lose,
        goalsFor: stats.all.goals.for,
        goalsAgainst: stats.all.goals.against,
        goalsDifference: stats.goalsDiff
      }
    });

    if (!created) {
      await teamCompetition.update({
        form: stats.form,
        position: stats.rank,
        points: stats.points,
        playedTotal: stats.all.played,
        playedHome: stats.home.played,
        playedAway: stats.away.played,
        winTotal: stats.all.win,
        winHome: stats.home.win,
        winAway: stats.away.win,
        drawTotal: stats.all.draw,
        drawHome: stats.home.draw,
        drawAway: stats.away.draw,
        losesTotal: stats.all.lose,
        losesHome: stats.home.lose,
        losesAway: stats.away.lose,
        goalsFor: stats.all.goals.for,
        goalsAgainst: stats.all.goals.against,
        goalsDifference: stats.goalsDiff
      });
    }
    logger.info(`Mise à jour des statistiques effectuées avec succès pour l'équipe ${teamID}`);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des statistiques: ', error);
  }
}

module.exports = {
  createOrUpdateTeams,
  updateTeamStats,
}