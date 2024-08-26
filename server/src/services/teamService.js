const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {Team, TeamCompetition} = require("../models");
const {downloadImage} = require("./imageService");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService");
const logger = require("../utils/logger/logger");
const {calculatePoints} = require("./betService");

/**
 * Retrieves all teams from the database.
 *
 * @return {Promise<Array<TeamCompetition>>} An array of TeamCompetition objects representing all teams.
 * @throws {Error} If there is an error retrieving the teams from the database.
 */
const getAllTeams = async () => {
  try {
    return await TeamCompetition.findAll()
  } catch (error) {
    logger.error('Erreur lors de la récupération des équipes: ', error);
  }
}

/**
 * Updates the rank of a team in a competition for a given season. If no team ID is provided,
 * updates the rank for all teams in the competition for the given season.
 *
 * @param {number|null} teamId - The ID of the team to update the rank for. If not provided,
 *        updates the rank for all teams in the competition for the given season.
 * @param {number|null} competitionId - The ID of the competition the team belongs to. If not
 *        provided, defaults to 61.
 * @param {string|null} seasonYear - The year of the season the team is competing in. If not
 *        provided, defaults to the current season year for the given competition.
 * @return {Promise<void>} - A promise that resolves when the rank is successfully updated for
 *         the team(s).
 * @throws {Error} - If there is an error retrieving the current season ID or season year, or if
 *         there is an error updating the rank for the team(s).
 */
const updateRank = async (teamId = null, competitionId = null, seasonYear = null) => {
  try {
    if (!competitionId) {
      competitionId = 61;
    }
    if (!seasonYear) {
      seasonYear = await getCurrentSeasonYear(competitionId)
    }
    const seasonId = await getCurrentSeasonId(competitionId);
    let teamsId = [teamId]
    if (teamsId.length === 0) {
      teamsId = await getAllTeams()
    }
    for (const team of teamsId) {
      const teamStatsOptions = {
        method: 'GET',
        url: apiBaseUrl + 'standings',
        params: {
          league: competitionId,
          season: seasonYear,
          team: team
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      };
      const apiResponse = await axios.request(teamStatsOptions);
      const leagueData = apiResponse.data.response[0];
      if (!leagueData || !leagueData.league || !leagueData.league.standings) {
        logger.error('No standings data found for the provided parameters');
        return;
      }
      const stats = leagueData.league.standings[0][0];
      if (!stats) {
        logger.error('No statistics data found for the team');
        return;
      }
      const [teamCompetition] = await TeamCompetition.find({
        where: {
          team_id: team,
          competition_id: competitionId,
          season_id: seasonId,
        },
      });

      if (teamCompetition) {
        await teamCompetition.update({
          position: stats.rank,
        });
        logger.info('Classement mis à jour');
      } else {
        logger.error('Team not reachable in the database');
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du classement: ', error);
  }
}

/**
 * Updates the rank of all teams in a competition for a given season. If no competition ID is provided,
 * updates the rank for all teams in the competition for the current season.
 *
 * @param {number|null} competitionId - The ID of the competition the team belongs to. If not
 *        provided, defaults to 61.
 * @param {string|null} seasonYear - The year of the season the team is competing in. If not
 *        provided, defaults to the current season year for the given competition.
 * @return {Promise<void>} - A promise that resolves when the rank is successfully updated for
 *         all teams in the competition.
 * @throws {Error} - If there is an error retrieving the current season ID or season year, or if
 *         there is an error updating the rank for any team.
 */
const updateRankAll = async (competitionId = null, seasonYear = null) => {
  try {
    if (!competitionId) {
      competitionId = 61;
    }
    if (!seasonYear) {
      seasonYear = await getCurrentSeasonYear(competitionId);
    }
    const seasonId = await getCurrentSeasonId(competitionId);

    const teamsId = await getAllTeams();

    const teamStatsOptions = {
      method: 'GET',
      url: apiBaseUrl + 'standings',
      params: {
        league: competitionId,
        season: seasonYear,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    };

    const apiResponse = await axios.request(teamStatsOptions);
    const leagueData = apiResponse.data.response[0];

    if (!leagueData || !leagueData.league || !leagueData.league.standings) {
      logger.error('No standings data found for the provided parameters');
      return;
    }

    const standings = leagueData.league.standings[0];

    for (const standing of standings) {
      const teamIdFromApi = standing.team.id;
      const teamRank = standing.rank;

      const teamCompetition = await TeamCompetition.findOne({
        where: {
          team_id: teamIdFromApi,
          competition_id: competitionId,
          season_id: seasonId,
        },
      });

      if (teamCompetition) {
        await teamCompetition.update({
          position: teamRank,
        });
        logger.info(`Classement mis à jour pour l'équipe ID ${teamIdFromApi}`);
      } else {
        logger.error(`Équipe avec ID ${teamIdFromApi} introuvable dans la base de données`);
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du classement: ', error);
  }
}

/**
 * Creates or updates teams based on the provided team IDs, season, competition ID, and update options.
 *
 * @param {Array|number} teamIDs - An array of team IDs or a single team ID. Default is an empty array.
 * @param {number} season - The season number. Required.
 * @param {string} competitionId - The competition ID. Required.
 * @param {boolean} updateInfos - Whether to update the team information. Default is true.
 * @param {boolean} updateStats - Whether to update the team stats. Default is true.
 * @return {Promise<string|void>} Returns a promise that resolves to 'Please provide a season number' if season is not provided, or 'Please provide a competition id' if competitionId is not provided. Otherwise, it resolves to undefined.
 */
async function createOrUpdateTeams(teamIDs = [], season = null, competitionId = null, updateInfos = true, updateStats = true) {
  if (!season) {
    console.log('Please provide a season number');
    return 'Please provide a season number';
  }
  if (!competitionId) {
    console.log('Please provide a competition id');
    return 'Please provide a competition id';
  }

  let teamsId = Array.isArray(teamIDs) ? teamIDs : [teamIDs];

  if (teamsId.length === 0) {
    teamsId = await getAllTeams();
  }

  try {
    let teams = [];
    if (updateInfos) {
      for (const teamID of teamsId) {
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
        where: teamsId.length ? { id: teamsId } : undefined,
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
        venue_name: team.venue_name || null,
        venue_address: team.venue_address || null,
        venue_city: team.venue_city || null,
        venue_capacity: team.venue_capacity || null,
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

/**
 * Updates the statistics of a team in a competition for a given season. If no team ID is provided,
 * updates the statistics for all teams in the competition for the given season.
 *
 * @param {number|null} competitionId - The ID of the competition the team belongs to. If not
 *        provided, defaults to 61.
 * @param {number|null} teamID - The ID of the team to update the statistics for. If not provided,
 *        updates the statistics for all teams in the competition for the given season.
 * @param {string|null} seasonYear - The year of the season the team is competing in. If not
 *        provided, defaults to the current season year for the given competition.
 * @return {Promise<void>} - A promise that resolves when the statistics are successfully updated for
 *         the team(s).
 * @throws {Error} - If there is an error retrieving the current season ID or season year, or if
 *         there is an error updating the statistics for the team(s).
 */
async function updateTeamStats(competitionId = null, teamID = null, seasonYear = null) {
  try {
    if (!competitionId) {
      competitionId = 61;
    }
    if (!seasonYear) {
      seasonYear = await getCurrentSeasonYear(competitionId)
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
        goals_difference: (stats.all.goals.for - stats.all.goals.against)
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
        goals_difference: (stats.all.goals.for - stats.all.goals.against)
      });
    }
    logger.info(`Mise à jour des statistiques effectuées avec succès pour l'équipe ${teamID}`);
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des statistiques: ', error);
  }
}

async function updateAllTeamsStats(competitionId = null, seasonYear = null) {
  try {
    if (!competitionId) {
      competitionId = 61;
    }
    if (!seasonYear) {
      seasonYear = await getCurrentSeasonYear(competitionId);
    }
    const seasonId = await getCurrentSeasonId(competitionId);

    if (!seasonId || !competitionId) {
      console.log('Missing required parameters');
      return 'Missing required parameters';
    }

    const teamStatsOptions = {
      method: 'GET',
      url: apiBaseUrl + 'standings',
      params: {
        league: competitionId,
        season: seasonYear,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
    };

    const statsResponse = await axios.request(teamStatsOptions);
    const leagueData = statsResponse.data.response[0];

    if (!leagueData || !leagueData.league || !leagueData.league.standings) {
      logger.error('No standings data found for the provided parameters');
      return;
    }

    const standings = leagueData.league.standings[0];

    for (const stats of standings) {
      const teamID = stats.team.id;

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
          goals_against: stats.all.goals.against,
          goals_difference: (stats.all.goals.for - stats.all.goals.against),
        },
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
          goals_difference: (stats.all.goals.for - stats.all.goals.against),
        });
      }

      logger.info(`Mise à jour des statistiques effectuée avec succès pour l'équipe ${teamID}`);
    }
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des statistiques: ', error);
  }
}

module.exports = {
  getAllTeams,
  updateRank,
  updateRankAll,
  createOrUpdateTeams,
  updateTeamStats,
  updateAllTeamsStats
}