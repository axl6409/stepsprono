const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {Match} = require("../models");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService");
const ProgressBar = require("progress");
const {Op} = require("sequelize");
const {schedule} = require("node-schedule");
const {checkBetByMatchId} = require("./betService");
const moment = require("moment");
const {getWeekDateRange, getMonthDateRange} = require("../services/appService");
const logger = require("../utils/logger/logger");
let cronTasks = [];

const updateMatchStatusAndPredictions = async (matchIds) => {
  if (!Array.isArray(matchIds)) {
    matchIds = [matchIds];
  }
  for (const matchId of matchIds) {
    await updateSingleMatch(matchId);
  }
}

const getCurrentWeekMatchdays = async () => {
  try {
    const matchdays = []
    const monthDates = getWeekDateRange();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: monthDates.start,
          [Op.lte]: monthDates.end
        }
      }
    })
    for (const match of matchs) {
      matchdays.push(match.matchday)
    }
    return matchdays
  } catch (error) {
    console.log( 'Erreur lors de la récupération des matchs du mois courant:', error)
  }
}

const getCurrentMonthMatchdays = async () => {
  try {
    const matchdays = []
    const monthDates = getMonthDateRange();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: monthDates.start,
          [Op.lte]: monthDates.end
        }
      }
    })
    for (const match of matchs) {
      matchdays.push(match.matchday)
    }
    return matchdays
  } catch (error) {
    console.log( 'Erreur lors de la récupération des matchs du mois courant:', error)
  }
}

function getMatchsCronTasks() {
  return cronTasks
}

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

      if (Object.keys(fieldsToUpdate).length > 0) {
        await checkBetByMatchId(matchId);
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour du match et des pronostics:', error);
  }
}

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
        season: seasonId,
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

async function fetchWeekMatches() {
  try {
    const startOfWeek = moment().startOf('isoWeek').tz("Europe/Paris");
    const endOfWeek = moment().endOf('isoWeek').tz("Europe/Paris");

    const startDate = startOfWeek.format('YYYY-MM-DD 00:00:00');
    const endDate = endOfWeek.format('YYYY-MM-DD 23:59:59');

    const matches = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        status: {
          [Op.not]: ['PST', 'FT']
        }
      }
    });
    matches.forEach(match => {
      const matchTime = new Date(match.utc_date)
      const updateTime = new Date(matchTime.getTime() + (2 * 60 + 10) * 60000)
      schedule.scheduleJob(updateTime, () => updateMatchStatusAndPredictions(match.id))
    });
  } catch (error) {
    console.log('Erreur lors de la récupération des matchs du weekend:', error);
  }
}

module.exports = {
  getCurrentWeekMatchdays,
  getCurrentMonthMatchdays,
  updateMatchStatusAndPredictions,
  updateSingleMatch,
  updateMatches,
  getMatchsCronTasks,
  fetchWeekMatches
};