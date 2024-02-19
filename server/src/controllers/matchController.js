const axios = require("axios");
const ProgressBar = require("progress");
const { Match, Bets} = require("../models");
const moment = require("moment-timezone");
const {Op} = require("sequelize");
const cron = require("node-cron");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("./seasonController");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
let cronTasks = [];

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
        utcDate: match.fixture.date,
        status: match.fixture.status.short,
        venue: match.fixture.venue.name,
        matchday: matchDay,
        stage: stage,
        homeTeamId: match.teams.home.id,
        awayTeamId: match.teams.away.id,
        league: competitionId,
        season: seasonId,
        winnerId: winner,
        goalsHome: match.goals.home,
        goalsAway: match.goals.away,
        scoreFullTimeHome: match.score.fulltime.home,
        scoreFullTimeAway: match.score.fulltime.away,
        scoreHalfTimeHome: match.score.halftime.home,
        scoreHalfTimeAway: match.score.halftime.away,
        scoreExtraTimeHome: match.score.extratime.home,
        scoreExtraTimeAway: match.score.extratime.away,
        scorePenaltyHome: match.score.penalty.home,
      })
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

async function updateMatchStatusAndPredictions(matchIds) {
  if (!Array.isArray(matchIds)) {
    matchIds = [matchIds];
  }
  for (const matchId of matchIds) {
    await updateSingleMatch(matchId);
  }
}

async function updateSingleMatch(matchId) {
  try {
    const options = {
      method: 'GET',
      url: `${apiBaseUrl}fixtures/`,
      params: {
        id: `${matchId}`
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
        fieldsToUpdate['winnerId'] = apiMatchData.teams.home.id
      } else if (apiMatchData.teams.away.winner === true) {
        fieldsToUpdate['winnerId'] = apiMatchData.teams.away.id
      } else {
        fieldsToUpdate['winnerId'] = null
      }
      if (dbMatchData['goalsHome'] !== apiMatchData.score.fulltime.home) {
        fieldsToUpdate['goalsHome'] = apiMatchData.score.fulltime.home
      }
      if (dbMatchData['goalsAway'] !== apiMatchData.score.fulltime.away) {
        fieldsToUpdate['goalsAway'] = apiMatchData.score.fulltime.away
      }
      if (dbMatchData['scoreFullTimeHome'] !== apiMatchData.score.halftime.home) {
        fieldsToUpdate['scoreFullTimeHome'] = apiMatchData.score.halftime.home
      }
      if (dbMatchData['scoreHalfTimeAway'] !== apiMatchData.score.fulltime.away) {
        fieldsToUpdate['scoreHalfTimeAway'] = apiMatchData.score.fulltime.away
      }
      if (dbMatchData['scoreExtraTimeHome'] !== apiMatchData.score.extratime.home) {
        fieldsToUpdate['scoreExtraTimeHome'] = apiMatchData.score.extratime.home
      }
      if (dbMatchData['scoreExtraTimeAway'] !== apiMatchData.score.extratime.away) {
        fieldsToUpdate['scoreExtraTimeAway'] = apiMatchData.score.extratime.away
      }
      if (dbMatchData['scorePenaltyHome'] !== apiMatchData.score.penalty.home) {
        fieldsToUpdate['scorePenaltyHome'] = apiMatchData.score.penalty.home
      }
      if (dbMatchData['scorers'] !== scorersJson) {
        fieldsToUpdate['scorers'] = scorersJson;
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        fieldsToUpdate['updatedAt'] = new Date();
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
        const bets = await Bets.findAll({where: {matchId}});
        for (const bet of bets) {
          let points = 0;
          console.log(bet.winnerId === fieldsToUpdate['winnerId'])
          if (bet.winnerId && bet.winnerId === fieldsToUpdate['winnerId']) {
            points += 1;
          }
          if (bet.homeScore === apiMatchData.score.fulltime.home && bet.awayScore === apiMatchData.score.fulltime.away) {
            points += 3;
          }
          if (bet.playerGoal) {
            if (dbMatchData.scorers && dbMatchData.scorers !== '[]') {
              const matchScorers = JSON.parse(dbMatchData.scorers);
              if (matchScorers.length > 0) {
                const scorerFound = matchScorers.some(scorer => scorer.playerId === bet.playerGoal);
                if (scorerFound) {
                  points += 1;
                }
              }
            }
          }
          await Bets.update({points}, {where: {id: bet.id}});
        }
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour du match et des pronostics:', error);
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
        utcDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
        status: {
          [Op.not]: ['PST', 'FT']
        }
      }
    });
    matches.forEach(match => {
      const matchTime = new Date(match.utcDate)
      const updateTime = new Date(matchTime.getTime() + (2 * 60 + 10) * 60000)
      const day = updateTime.getDate();
      const month = updateTime.getMonth() + 1;
      const hour = updateTime.getHours();
      const minute = updateTime.getMinutes();
      const cronTime = `${minute} ${hour} ${day} ${month} *`;
      console.log(cronTime + ' | ' + match.id)
      cronTasks.push({
        cronTime: cronTime,
        id: match.id
      })
      cron.schedule(cronTime, () => updateMatchStatusAndPredictions(match.id))
    });
    return cronTasks
  } catch (error) {
    console.log('Erreur lors de la récupération des matchs du weekend:', error);
  }
}

function getMatchsCronTasks() {
  return cronTasks
}

module.exports = {
  updateMatches,
  updateMatchStatusAndPredictions,
  fetchWeekMatches,
  getMatchsCronTasks,
};