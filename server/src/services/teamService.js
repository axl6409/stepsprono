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
            logo_url: team.team.logo,
            venue_name: team.venue ? team.venue.name : null,
            venue_address: team.venue ? team.venue.address : null,
            venue_city: team.venue ? team.venue.city : null,
            venue_capacity: team.venue ? team.venue.capacity : null,
            venue_image: team.venue && team.venue.image ? team.venue.image : null
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
      let logoUrl = team.logo_url;
      let venueImageUrl = team.venue_image;
      const existingTeam = await Team.findByPk(team.id);
      if (existingTeam) {
        logoUrl = existingTeam.logo_url || logoUrl;
        venueImageUrl = existingTeam.venue_image || venueImageUrl;
      } else {
        if (team.logo_url) {
          logoUrl = await downloadImage(team.logo_url, team.id, 'logo');
        }
        if (team.venue_image) {
          venueImageUrl = await downloadImage(team.venue_image, team.id, 'venue');
        }
      }

      await Team.upsert({
        id: team.id,
        name: team.name,
        code: team.code,
        logo_url: logoUrl,
        venue_name: team.venue_name ? team.venue_name : null,
        venue_address: team.venue_address ? team.venue_address : null,
        venue_city: team.venue_city ? team.venue_city : null,
        venue_capacity: team.venue_capacity ? team.venue_capacity : null,
        venue_image: venueImageUrl,
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
    const leagueData = statsResponse.data.response[0];
    if (!leagueData || !leagueData.league || !leagueData.league.standings) {
      logger.error('No standings data found for the provided parameters');
      return;
    }
    const stats = leagueData.league.standings[0][0];
    if (!stats) {
      logger.error('No statistics data found for the team');
      return;
    }
    const [teamCompetition, created] = await TeamCompetition.findOrCreate({
      where: {
        team_id: teamID,
        competition_id: competitionId,
        season_id: seasonId,
      },
      defaults: {
        team_id: teamID,
        competition_id: competitionId,
        season_id: seasonId,
        form: stats.form,
        position: stats.rank,
        points: stats.points,
        played_total: stats.all.played,
        played_home: stats.home.played,
        played_away: stats.away.played,
        win_total: stats.all.win,
        win_home: stats.home.win,
        win_away: stats.away.win,
        draw_total: stats.all.draw,
        draw_home: stats.home.draw,
        draw_away: stats.away.draw,
        loses_total: stats.all.lose,
        loses_home: stats.home.lose,
        loses_away: stats.away.lose,
        goals_for: stats.all.goals.for,
        goals_away: stats.all.goals.against,
        goals_difference: stats.goalsDiff
      }
    });

    if (!created) {
      await teamCompetition.update({
        form: stats.form,
        position: stats.rank,
        points: stats.points,
        played_total: stats.all.played,
        played_home: stats.home.played,
        played_away: stats.away.played,
        win_total: stats.all.win,
        win_home: stats.home.win,
        win_away: stats.away.win,
        draw_total: stats.all.draw,
        draw_home: stats.home.draw,
        draw_away: stats.away.draw,
        loses_total: stats.all.lose,
        loses_home: stats.home.lose,
        loses_away: stats.away.lose,
        goals_for: stats.all.goals.for,
        goals_against: stats.all.goals.against,
        goals_difference: stats.goalsDiff
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