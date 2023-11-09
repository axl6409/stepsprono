const cron = require('node-cron')
const axios = require('axios');
const { Match, Team, Area} = require('./src/models');
const ProgressBar = require('progress');
const apiKey = process.env.FBD_API_KEY;

async function updateTeams() {
  try {
    const count = await Team.count();
    if (count === 0) {
      const response = await axios.get('https://api.football-data.org/v4/competitions/FL1/teams', {
        headers: { 'X-Auth-Token': apiKey }
      })
      const teams = response.data.teams;
      for (const team of teams) {
        await Team.create({
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          tla: team.tla,
          logoUrl: team.crest,
          competitionId: 2015,
        })
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

async function updateMatches() {
  try {
    const response = await axios.get('https://api.football-data.org/v4/competitions/FL1/matches', {
      headers: { 'X-Auth-Token': apiKey }
    });
    const matches = response.data.matches;
    const bar = new ProgressBar(':bar :percent', { total: matches.length });
    for (const match of matches) {
      let winner = null
      if (match.score.winner === 'HOME_TEAM') {
        winner = match.homeTeam.name
      } else if (match.score.winner === 'AWAY_TEAM') {
        winner = match.awayTeam.name
      } else if (match.score.winner === 'DRAW') {
        winner = "DRAW"
      }
      bar.tick();
      await Match.upsert({
        id: match.id,
        utcDate: match.utcDate,
        status: match.status,
        matchday: match.matchday,
        stage: match.stage,
        homeTeamId: match.homeTeam.id,
        awayTeamId: match.awayTeam.id,
        areaId: match.area.id,
        competitionId: match.competition.id,
        seasonId: match.season.id,
        winner: winner,
        scoreFullTimeHome: match.score.fullTime.home,
        scoreFullTimeAway: match.score.fullTime.away,
        scoreHalfTimeHome: match.score.halfTime.home,
        scoreHalfTimeAway: match.score.halfTime.away,
      })
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

const runCronJob = () => {
  cron.schedule('31 00 * * *', updateTeams)

  cron.schedule('32 00 * * *', updateMatches)
}

module.exports = { runCronJob, updateTeams, updateMatches };