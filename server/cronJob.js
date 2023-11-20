const cron = require('node-cron')
const axios = require('axios');
const { Match, Team, Area} = require('./src/models');
const ProgressBar = require('progress');
const fs = require("fs");
const path = require("path");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

async function downloadImage(url, teamId) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const dir = path.join(__dirname, `../client/src/assets/teams/${teamId}`);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    const pathToFile = path.join(dir, 'logo.jpg'); // Changez le nom de fichier selon vos besoins
    const writer = fs.createWriteStream(pathToFile);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
  }
}

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

async function updateTeamsRanking() {
  try {
    const response = await axios.get('https://api.football-data.org/v4/competitions/FL1/standings?season=2023', {
      headers: { 'X-Auth-Token': apiKey }
    })
    const ranking = response.data.standings[0].table;
    for (const teamInfo of ranking) {
      await Team.update({
        position: teamInfo.position,
        playedGames: teamInfo.playedGames,
        won: teamInfo.won,
        draw: teamInfo.draw,
        lost: teamInfo.lost,
        form: teamInfo.form,
        points: teamInfo.points,
        goalsFor: teamInfo.goalsFor,
        goalsAgainst: teamInfo.goalsAgainst,
        goalDifference: teamInfo.goalDifference
      }, {
        where: { id: teamInfo.team.id }
      });
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

async function updateMatches() {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'fixtures',
      params: {
        league: '61',
        season: '2023'
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
      for (team of match.teams) {
        if (team.winner === true) {
          winner = team.id
        }
      }
      bar.tick();

      let [stage, matchDay] = match.league.round.split(' - ');
      stage = stage.trim();
      matchDay = parseInt(matchDay, 10);

      await Match.upsert({
        id: match.fixture.id,
        utcDate: match.fixture.date,
        status: match.status.short,
        venue: match.venue.name,
        matchday: matchDay,
        stage: stage,
        homeTeamId: match.teams.home.id,
        awayTeamId: match.teams.away.id,
        league: match.league.id,
        season: match.league.season,
        winner: winner,
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

const runCronJob = () => {
  cron.schedule('31 00 * * *', updateTeams)
  cron.schedule('32 00 * * *', updateMatches)
  cron.schedule('33 00 * * *', updateTeamsRanking)
}

module.exports = { runCronJob, updateTeams, updateMatches, updateTeamsRanking };