const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {Match, Team, Bet, User, Player} = require("../models");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("./seasonService");
const ProgressBar = require("progress");
const {Op} = require("sequelize");
const { sequelize } = require('../models');
const {schedule, scheduleJob} = require("node-schedule");
const {checkBetByMatchId} = require("./betService");
const moment = require("moment");
const {getWeekDateRange} = require("./appService");
const logger = require("../utils/logger/logger");
const {createOrUpdateTeams} = require("./teamService");
const eventBus = require("../events/eventBus");
let cronTasks = [];

const getMatchAndBets = async (matchId) => {
  try {
    const matchWithBets = await Match.findOne({
      where: { id: matchId },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' },
        {
          model: Bet,
          as: 'MatchId',
          include: [
            { model: User, as: 'UserId', attributes: ['username'] },
            { model: Player, as: 'PlayerGoal' }
          ],
          required: false
        },
      ]
    });

    if (!matchWithBets) {
      throw new Error('Match non trouvé');
    }

    return {
      match: matchWithBets,
      homeTeam: matchWithBets.HomeTeam,
      awayTeam: matchWithBets.AwayTeam,
      bets: matchWithBets.Bets
    };
  } catch (error) {
    logger.info('Erreur lors de la récupération des matchs et des pronostics : ', error);
    throw error;
  }
};

/**
 * Updates the specified matches and their corresponding predictions records.
 *
 * @param {number|number[]} matchIds - The ID(s) of the match(es) to update.
 * @return {Promise<void>} - A promise that resolves when all matches have been updated.
 */
const updateMatchAndPredictions = async (matchIds) => {
  if (!Array.isArray(matchIds)) {
    matchIds = [matchIds];
  }
  for (const matchId of matchIds) {
    await updateSingleMatch(matchId);
  }
}

/**
 * Returns the array of cron tasks.
 *
 * @return {Array} The array of cron tasks.
 */
function getMatchsCronTasks() {
  return cronTasks
}

/**
 * Updates a single match and its corresponding prediction records.
 *
 * @param {number} matchId - The ID of the match to update.
 * @return {Promise<void>} - A promise that resolves when the match has been updated.
 */
async function updateSingleMatch(matchId) {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'fixtures',
      params: {
        id: matchId
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const apiMatchData = response.data.response[0];
    const events = []
    const scorers = apiMatchData.events
      .filter(event => event.type === 'Goal')
      .map(goalEvent => ({
        playerId: goalEvent.player.id,
        playerName: goalEvent.player.name
      }));
    const scorersJson = JSON.stringify(scorers);
    const dbMatchData = await Match.findByPk(matchId);
    if (dbMatchData && apiMatchData) {
      const fieldsToUpdate = {};
      if (dbMatchData['status'] !== apiMatchData.fixture.status.short) {
        fieldsToUpdate['status'] = apiMatchData.fixture.status.short
      }
      if (apiMatchData.teams.home.winner === true) {
        fieldsToUpdate['winner_id'] = apiMatchData.teams.home.id
      } else if (apiMatchData.teams.away.winner === true) {
        fieldsToUpdate['winner_id'] = apiMatchData.teams.away.id
      } else {
        fieldsToUpdate['winnerId'] = null
      }
      if (dbMatchData['goals_home'] !== apiMatchData.score.fulltime.home) {
        fieldsToUpdate['goals_home'] = apiMatchData.score.fulltime.home
      }
      if (dbMatchData['goals_away'] !== apiMatchData.score.fulltime.away) {
        fieldsToUpdate['goals_away'] = apiMatchData.score.fulltime.away
      }
      if (dbMatchData['score_full_time_home'] !== apiMatchData.score.fulltime.home) {
        fieldsToUpdate['score_full_time_home'] = apiMatchData.score.fulltime.home
      }
      if (dbMatchData['score_full_time_away'] !== apiMatchData.score.fulltime.away) {
        fieldsToUpdate['score_full_time_away'] = apiMatchData.score.fulltime.away
      }
      if (dbMatchData['score_half_time_home'] !== apiMatchData.score.fulltime.home) {
        fieldsToUpdate['score_half_time_home'] = apiMatchData.score.fulltime.home
      }
      if (dbMatchData['score_half_time_away'] !== apiMatchData.score.fulltime.away) {
        fieldsToUpdate['score_half_time_away'] = apiMatchData.score.fulltime.away
      }
      if (dbMatchData['score_extra_time_home'] !== apiMatchData.score.extratime.home) {
        fieldsToUpdate['score_extra_time_home'] = apiMatchData.score.extratime.home
      }
      if (dbMatchData['score_extra_time_away'] !== apiMatchData.score.extratime.away) {
        fieldsToUpdate['score_extra_time_away'] = apiMatchData.score.extratime.away
      }
      if (dbMatchData['score_penalty_home'] !== apiMatchData.score.penalty.home) {
        fieldsToUpdate['score_penalty_home'] = apiMatchData.score.penalty.home
      }
      if (dbMatchData['score_extra_time_away'] !== apiMatchData.score.penalty.away) {
        fieldsToUpdate['score_extra_time_away'] = apiMatchData.score.penalty.away
      }
      if (dbMatchData['scorers'] !== scorersJson) {
        fieldsToUpdate['scorers'] = scorersJson;
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        fieldsToUpdate['updated_at'] = new Date();
        await Match.update(fieldsToUpdate, {where: {id: matchId}});
      }

      for (const goals of apiMatchData.events) {
        if (goals.type === 'Goal') {
          events.push({
            id: goals.player.id,
          });
        }
      }

      const updatedMatchData = await Match.findByPk(matchId);
      if (updatedMatchData.status === 'FT') {
        await checkBetByMatchId(matchId);
        logger.info(`Pronostics vérifiés pour le match: ${matchId}`);
        eventBus.emit('matchUpdated', { matchId });
      } else {
        console.log("Le statut du match n'est pas encore 'FT', vérification des pronostics annulée.");
      }
    }
    logger.info("Match updated", matchId);
  } catch (error) {
    console.log('Erreur lors de la mise à jour du match et des pronostics:', error);
    logger.error("Error updating match and bets:", error);
  }
}

/**
 * Updates the matches for a given competition.
 *
 * @param {number|null} competitionId - The ID of the competition. If not provided, the function logs a message and returns.
 * @return {Promise<void>} A promise that resolves when the matches have been updated.
 */
async function updateMatches(competitionId = null) {
  try {
    if (!competitionId) {
      console.log('Please provide a competition id');
      return
    }
    const seasonId = await getCurrentSeasonId(competitionId)
    const seasonYear = await getCurrentSeasonYear(competitionId)
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'fixtures',
      params: {
        league: competitionId,
        season: seasonYear
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const matches = response.data.response;
    const bar = new ProgressBar(':bar :percent', { total: matches.length });

    for (const match of matches) {
      let winner = null
      if (match.teams.home.winner === true) {
        winner = match.teams.home.id
      }
      if (match.teams.away.winner === true) {
        winner = match.teams.away.id
      }

      bar.tick();

      let [stage, matchDay] = match.league.round.split(' - ');
      stage = stage.trim();
      matchDay = parseInt(matchDay, 10);

      await Match.upsert({
        id: match.fixture.id,
        utc_date: match.fixture.date,
        status: match.fixture.status.short,
        venue: match.fixture.venue.name,
        matchday: matchDay,
        stage: stage,
        home_team_id: match.teams.home.id,
        away_team_id: match.teams.away.id,
        competition_id: competitionId,
        season_id: seasonId,
        winner_id: winner,
        goals_home: match.goals.home,
        goals_away: match.goals.away,
        score_full_time_home: match.score.fulltime.home,
        score_full_time_away: match.score.fulltime.away,
        score_half_time_home: match.score.halftime.home,
        score_half_time_away: match.score.halftime.away,
        score_extra_time_home: match.score.extratime.home,
        score_extra_time_away: match.score.extratime.away,
        score_penalty_home: match.score.penalty.home,
      })
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

/**
 * Fetches all matches within the current week and schedules jobs to update match and predictions data.
 *
 * @return {Promise<void>} A promise that resolves when all matches have been fetched and jobs have been scheduled.
 */
async function fetchAndProgramWeekMatches() {
  try {
    // const simNow = moment().set({ 'year': 2024, 'month': 7, 'date': 13 });
    const now = moment().tz("Europe/Paris");
    logger.info('[CRON]=> fetchAndProgramWeekMatches => Now: ' + now.format('YYYY-MM-DD HH:mm:ss'));
    const startOfWeek = now.clone().startOf('isoWeek');
    const endOfWeek = now.clone().endOf('isoWeek');

    const startDate = startOfWeek.clone().utc().format();
    const endDate = endOfWeek.clone().utc().format();
    logger.info(`[CRON]=> fetchAndProgramWeekMatches => Start Date: ${startDate} - End Date: ${endDate}`);
    const matches = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        status: {
          [Op.not]: ['PST', 'FT', 'TBD']
        }
      }
    });
    logger.info(`[CRON]=> fetchAndProgramWeekMatches => Number of matches: ${matches.length}`);
    matches.forEach(match => {
      logger.info(`[CRON]=> fetchAndProgramWeekMatches => MatchID: ${match.id}, UTC: ${match.utc_date}`);
      const matchTime = new Date(match.utc_date);
      const initialDelay = 110 * 60000;
      const initialTime = new Date(matchTime.getTime() + initialDelay);

      scheduleJob(initialTime, function executeJob() {
        updateMatchAndPredictions(match.id);
        createOrUpdateTeams([match.home_team_id, match.away_team_id], match.season_id, match.competition_id, false, true);
        logger.info(`[CRON]=> updateMatchAndPredictions : ID: ${match.id}, UTC: ${match.utc_date}`);

        const recurringJob = setInterval(() => {
          updateMatchAndPredictions(match.id);
          createOrUpdateTeams([match.home_team_id, match.away_team_id], match.season_id, match.competition_id, false, true);
          logger.info(`[CRON RECURRING]=> updateMatchAndPredictions : ID: ${match.id}, UTC: ${match.utc_date}`);
        }, 2 * 60000);

        setTimeout(() => {
          clearInterval(recurringJob);
          logger.info(`[CRON RECURRING STOPPED]=> Stopped recurring updates for match ID: ${match.id}`);
        }, 15 * 60000);
      });

      logger.info(`[CRON SETUP]=> Initial job set for match ID: ${match.id}, Start at: ${initialTime}`);
    });
  } catch (error) {
    console.log('Erreur lors de la récupération des matchs du weekend:', error);
  }
}

async function fetchWeekMatches() {
  try {
    // const simNow = moment().set({ 'year': 2024, 'month': 7, 'date': 13 });
    const now = moment().tz("Europe/Paris");

    const startOfWeek = now.clone().startOf('isoWeek');
    const endOfWeek = now.clone().endOf('isoWeek');

    const startDate = startOfWeek.clone().utc().format();
    const endDate = endOfWeek.clone().utc().format();

    const matches = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        status: {
          [Op.not]: ['PST', 'FT', 'TBD']
        }
      }
    });

    return matches;
  } catch (error) {
    console.log('Erreur lors de la récupération des matchs de la semaine:', error);
  }
}


/**
 * Updates the require_details field for the last matches of each competition, season, and matchday.
 *
 * @return {Promise<void>} A promise that resolves when the updates are complete.
 */
async function updateRequireDetails() {
  try {
    const lastMatches = await sequelize.query(
      `
      SELECT m.id
      FROM matchs m
      INNER JOIN (
        SELECT competition_id, season_id, matchday, MAX(utc_date) as latest_utc_date
        FROM matchs
        WHERE status = 'NS'
        GROUP BY competition_id, season_id, matchday
      ) groupedMatches 
      ON m.competition_id = groupedMatches.competition_id
      AND m.season_id = groupedMatches.season_id
      AND m.matchday = groupedMatches.matchday
      AND m.utc_date = groupedMatches.latest_utc_date
      AND m.status = 'NS'
      `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const matchIds = lastMatches.map(match => match.id);

    await Match.update(
      { require_details: true },
      {
        where: {
          id: {
            [Op.in]: matchIds
          }
        }
      }
    );

    console.log(`${matchIds.length} matches have been updated with require_details set to true.`);
  } catch (error) {
    console.error('An error occurred while updating the matches:', error);
  }
}

/**
 * Fetches matchs that have not been checked within the current week.
 *
 * @return {Promise<{data: Array<Match>, count: number}>} An object containing an array of matchs and the count of matchs.
 * @throws {Error} If there is an error fetching the matchs.
 */
const fetchMatchsNoChecked = async () => {
  try {
    const week = getWeekDateRange();
    const startOfWeek = week.start;
    const endOfWeek = week.end;
    console.log('Date Range:', startOfWeek, endOfWeek);
    const matchs = await Match.findAndCountAll({
      where: {
        utc_date: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek
        },
        status: {
          [Op.in]: ['NS', 'PST', 'HT', '1H', '2H', 'ET', 'BT', 'P']
        }
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    return {
      data: matchs.rows,
      count: matchs.count
    };
  } catch (error) {
    console.log('Erreur lors de la création des matchs:', error);
  }
}

module.exports = {
  getMatchAndBets,
  updateMatchAndPredictions,
  updateSingleMatch,
  updateMatches,
  getMatchsCronTasks,
  fetchAndProgramWeekMatches,
  fetchWeekMatches,
  updateRequireDetails,
  fetchMatchsNoChecked
};