const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {Match, Team, Bet, User, Player} = require("../models");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("./seasonService");
const {Op, Sequelize} = require("sequelize");
const { sequelize } = require('../models');
const {schedule, scheduleJob} = require("node-schedule");
const {checkBetByMatchId} = require("./logic/betLogic");
const moment = require("moment");
const {getWeekDateRange, getPeriodMatchdays} = require("./appService");
const logger = require("../utils/logger/logger");
const {createOrUpdateTeams} = require("./teamService");
const eventBus = require("../events/eventBus");
const {getCurrentCompetitionId} = require("./competitionService");
const {matchEndedNotification} = require("./notificationService");
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
    const moment = require("moment-timezone")

    const options = {
      method: 'GET',
      url: apiBaseUrl + 'fixtures',
      params: {
        league: competitionId,
        season: seasonYear,
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const matches = response.data.response;

    for (const match of matches) {
      let winner = null
      if (match.teams.home.winner === true) {
        winner = match.teams.home.id
      }
      if (match.teams.away.winner === true) {
        winner = match.teams.away.id
      }

      let [stage, matchDay] = match.league.round.split(' - ');
      stage = stage.trim();
      matchDay = parseInt(matchDay, 10);

      logger.info(`[MATCH SERVICE] MatchID: ${match.fixture.id}, UTC: ${match.fixture.date}`);

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

      logger.info(`[MATCH SERVICE] Match ${match.fixture.id} updated | MATCHDAY : ${matchDay} | STAGE : ${stage} | WINNER : ${winner} | STATUS : ${match.fixture.status.short}`);
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

/**
 * Mise à jour des dates des matchs pour les adapter au fuseau horaire de Paris.
 *
 * @async
 * @function updateExistingMatchDates
 * @returns {Promise<void>}
 */
async function updateExistingMatchDates() {
  try {
    const matches = await Match.findAll();

    for (const match of matches) {
      const utcDateStr = match.utc_date instanceof Date ? match.utc_date.toISOString() : match.utc_date;

      logger.info(`[MATCH UTC] ${utcDateStr}`);

      // Mise à jour du match avec la nouvelle date
      await Match.update(
        { utc_date: utcDateStr },
        { where: { id: match.id } }
      );

      logger.info(`[MATCH SERVICE] Match ${match.id} updated | UTC DATE : ${utcDateStr}`);
    }

    logger.info("✅ Mise à jour des dates terminée !");
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des dates :", error);
  }
}

/**
 * Fetches all matches within the current week and schedules jobs to update match and predictions data.
 *
 * @return {Promise<void>} A promise that resolves when all matches have been fetched and jobs have been scheduled.
 */
async function fetchAndProgramWeekMatches() {
  try {
    const now = moment().tz("Europe/Paris");
    logger.info('[CRON]=> fetchAndProgramWeekMatches => Now: ' + now.format('YYYY-MM-DD HH:mm:ss'));

    const startOfWeek = now.clone().startOf('isoWeek').format(); // ISO string en heure locale
    const endOfWeek = now.clone().endOf('isoWeek').format();

    logger.info(`[CRON]=> fetchAndProgramWeekMatches => Start Date: ${startOfWeek} - End Date: ${endOfWeek}`);

    const matches = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek
        },
        status: {
          [Op.not]: ['PST', 'FT', 'TBD']
        }
      }
    });

    logger.info(`[CRON]=> fetchAndProgramWeekMatches => Number of matches: ${matches.length}`);
    matches.forEach(match => {
      // Plus besoin de moment.utc() ici — utc_date est déjà en timezone correcte
      const matchTime = moment(match.utc_date).tz("Europe/Paris");

      const jobParisTime = matchTime.clone()
        .add(100, 'minutes')
        .format("YYYY-MM-DD HH:mm:ss");

      logger.info(`[CRON SETUP]=> Smart job set for match ID: ${match.id}, First check at (Paris): ${jobParisTime}`);

      scheduleSmartMatchCheck(match);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des matchs du weekend:', error);
  }
}


async function fetchWeekMatches(weekStart = false) {
  try {
    // const simNow = moment().set({ 'year': 2024, 'month': 7, 'date': 13 });
    const now = moment().tz("Europe/Paris");

    var startOf = now.clone();
    if (weekStart === true) {
      startOf = now.clone().startOf('isoWeek');
    }
    const endOfWeek = now.clone().endOf('isoWeek');

    const startDate = startOf.clone().utc().format();
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
 * Retrieves all matches that have not been checked yet (i.e., matches that are not
 * finished and have not been checked for updates) for the current week.
 *
 * @return {Promise<{data: Match[], count: number}>} A promise that resolves with an object
 * containing an array of matches and the total count of matches.
 */
const fetchMatchsNoChecked = async () => {
  try {
    const week = getWeekDateRange();
    const startOfWeek = week.start;
    const endOfWeek = week.end;

    const matchs = await Match.findAndCountAll({
      where: {
        utc_date: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek
        },
        status: {
          [Op.in]: ['NS', 'TBD', 'PST','1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'PST']
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

const getAvailableMonthsWithMatches = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const monthsWithMatches = await Match.findAll({
      attributes: [
        [Sequelize.literal('DISTINCT EXTRACT(MONTH FROM "utc_date")'), 'month'],
      ],
      where: {
        status: { [Op.ne]: 'TBD' },
        season_id: seasonId
      },
    });

    const monthsWithMatchdays = await Promise.all(monthsWithMatches.map(async (monthMatch) => {
      const month = monthMatch.getDataValue('month');

      const startDate = new Date(new Date().getFullYear(), month - 1, 1);
      const endDate = new Date(new Date().getFullYear(), month, 0);

      const matchdays = await getPeriodMatchdays(startDate, endDate);

      return { month, matchdays };
    }));

    return monthsWithMatchdays;
  } catch (error) {
    console.error('Erreur lors de la récupération des mois et matchdays : ', error);
    throw error;
  }
};

const getPastAndCurrentMatchdays = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const today = new Date();

    const matches = await Match.findAll({
      where: {
        competition_id: competitionId,
        season_id: seasonId,
        utc_date: {
          [Op.lte]: today
        }
      },
      order: [['utc_date', 'ASC']]
    });

    if (matches.length > 0) {
      const matchdays = Array.from(new Set(matches.map(match => match.matchday)));

      return matchdays;
    } else {
      logger.info('Aucun match passé ou en cours.');
      return [];
    }

  } catch (error) {
    logger.error('Erreur lors de la récupération des matchdays passés et actuels :', error);
    throw error;
  }
};

const getCurrentMatchday = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    // Récupérer tous les matchs de la saison actuelle
    const matches = await Match.findAll({
      where: {
        competition_id: competitionId,
        season_id: seasonId
      },
      order: [['utc_date', 'ASC']]
    });

    const today = new Date();

    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);

    const matchesThisWeek = matches.filter(match => {
      const matchDate = new Date(match.utc_date);
      return matchDate >= startOfWeek && matchDate <= endOfWeek;
    });

    if (matchesThisWeek.length > 0) {
      return matchesThisWeek[0].matchday;
    } else {
      console.log('Aucun match prévu cette semaine.');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la recuperation du matchday : ', error);
    throw error;
  }
};

const scheduleSmartMatchCheck = (match) => {
  const matchStart = moment.utc(match.utc_date.toISOString());
  const firstCheckTime = matchStart.clone().add(108, 'minutes').toDate();

  let retryCount = 0;
  const maxRetries = 10;
  const retryDelayMs = 3 * 60 * 1000;

  const acceptedStatuses = ['FT', 'PST', 'AET', 'PEN'];

  const checkJob = async () => {
    try {
      const options = {
        method: 'GET',
        url: `${apiBaseUrl}fixtures`,
        params: { id: match.id },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      };

      const response = await axios.request(options);
      const apiMatchData = response.data.response[0];

      const status = apiMatchData.fixture.status.short;
      logger.info(`[MATCH CHECK] Match ${match.id} status from API: ${status}`);

      if (acceptedStatuses.includes(status)) {
        await updateMatchAndPredictions(match.id);
        await createOrUpdateTeams(
          [match.home_team_id, match.away_team_id],
          match.season_id,
          match.competition_id,
          false,
          true
        );
        logger.info(`[MATCH CHECK DONE] Match ${match.id} updated and teams synced.`);
        matchEndedNotification(apiMatchData.teams.home.name, apiMatchData.teams.away.name, apiMatchData.goals.home, apiMatchData.goals.away);
        return;
      } else {
        logger.info(`[MATCH CHECK] Match ${match.id} not finished. Status: ${status}`);
      }

      if (retryCount < maxRetries) {
        retryCount++;
        logger.info(`[MATCH CHECK RETRY] Match ${match.id} not finished. Retry #${retryCount}`);
        setTimeout(checkJob, retryDelayMs);
      } else {
        logger.warn(`[MATCH CHECK] Max retries reached for match ${match.id}.`);
      }
    } catch (error) {
      logger.error(`[MATCH CHECK ERROR] Failed to check match ${match.id}:`, error);
    }
  };

  scheduleJob(firstCheckTime, checkJob);
};

module.exports = {
  getMatchAndBets,
  updateMatchAndPredictions,
  updateSingleMatch,
  updateMatches,
  updateExistingMatchDates,
  getMatchsCronTasks,
  fetchAndProgramWeekMatches,
  fetchWeekMatches,
  updateRequireDetails,
  fetchMatchsNoChecked,
  getAvailableMonthsWithMatches,
  getPastAndCurrentMatchdays,
  getCurrentMatchday
};