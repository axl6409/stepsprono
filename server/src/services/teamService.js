const axios = require("axios");
const {Team, TeamCompetition} = require("../models");
const {downloadImage} = require("./imageService");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService");
const logger = require("../utils/logger/logger");
const {calculatePoints} = require("./betService");

async function createOrUpdateTeams(teamIDs = [], season = null, competitionId = null, includeStats = false, onlyUpdateStats = false) {
  if (typeof teamIDs === 'number') {
    teamIDs = [teamIDs];
  }
  try {
    let teams = [];
    if (!onlyUpdateStats) {
      if (!season) {
        console.log('Please provide a season number');
        return 'Please provide a season number';
      }
      if (!competitionId) {
        console.log('Please provide a competition id');
        return 'Please provide a competition id';
      }
      for (const teamID of teamIDs) {
        const teamInfosOptions = {
          method: 'GET',
          url: `${apiBaseUrl}teams/${teamID}`,
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        };
        const teamResponse = await axios.request(teamInfosOptions);
        if (teamResponse.data.response) {
          teams.push(...teamResponse.data.response);
        }
      }
    } else {
      teams = await Team.findAll({
        where: teamIDs.length ? { id: teamIDs } : undefined,
      });
    }

    for (const teamData of teams) {
      let logoUrl = teamData.dataValues.logoUrl;
      let venueImageUrl = teamData.dataValues.venueImage;

      const existingTeam = await Team.findByPk(teamData.dataValues.id);
      if (existingTeam) {
        logoUrl = existingTeam.logoUrl || logoUrl;
        venueImageUrl = existingTeam.venueImage || venueImageUrl;
      } else {
        if (teamData.dataValues.logoUrl) {
          logoUrl = await downloadImage(teamData.dataValues.logoUrl, teamData.dataValues.id, 'logo');
        }
        if (teamData.dataValues.venueImage) {
          venueImageUrl = await downloadImage(teamData.dataValues.venueImage, teamData.dataValues.id, 'venue');
        }
      }

      const seasonId = await getCurrentSeasonId(competitionId);
      const seasonYear = await getCurrentSeasonYear(competitionId);

      await Team.upsert({
        id: teamData.dataValues.id,
        name: teamData.dataValues.name,
        code: teamData.dataValues.code,
        logoUrl: logoUrl,
        venueName: teamData.dataValues.venueName ? teamData.dataValues.venueName : null,
        venueAddress: teamData.dataValues.venueAddress ? teamData.dataValues.venueAddress : null,
        venueCity: teamData.dataValues.venueCity ? teamData.dataValues.venueCity : null,
        venueCapacity: teamData.dataValues.venueCapacity ? teamData.dataValues.venueCapacity : null,
        venueImage: venueImageUrl,
      });

      if (includeStats || onlyUpdateStats) {
        await updateTeamStats(competitionId, teamData.dataValues.id, seasonYear);
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
    const seasonId = await getCurrentSeasonId(competitionId);
    if (!seasonId || !competitionId || !teamID) {
      console.log('Missing required parameters');
      return 'Missing required parameters';
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

    const [teamCompetition, created] = await TeamCompetition.findOrCreate({
      where: {
        teamId: teamID,
        competitionId: stats.league.id,
        seasonId: seasonId,
      },
      defaults: {
        teamId: teamID,
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
      }
    });

    if (!created) {
      await teamCompetition.update({
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
    }
    logger.info(`Mise à jour des statistiques effectuées avec succès pour l'équipe ${teamID}`);
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
  updateTeamStats,
  updateTeamsRanking,
}