const cron = require('node-cron')
const axios = require('axios');
const { Match, Team, Area} = require('./src/models');
const ProgressBar = require('progress');
const fs = require("fs");
const path = require("path");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

function calculatePoints(wins, draws, loses) {
  return (wins * 3) + draws;
}

async function downloadImage(url, teamId, imageType) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const extension = url.split('.').pop();
    const fileName = `${imageType}_${teamId}.${extension}`;
    const dir = path.join(__dirname, `../client/src/assets/teams/${teamId}`);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    const pathToFile = path.join(dir, fileName);
    const writer = fs.createWriteStream(pathToFile);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(pathToFile));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
  }
}

async function updateTeams() {
  try {
    const teamInfosOptions = {
      method: 'GET',
      url: apiBaseUrl + 'teams',
      params: {
        league: '61',
        season: '2023'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    }
    const teamResponse = await axios.request(teamInfosOptions);
    const teams = teamResponse.data.response;

    for (const team of teams) {
      const teamStatsOptions = {
        method: 'GET',
        url: apiBaseUrl + 'teams/statistics',
        params: {
          league: '61',
          season: '2023',
          team: team.team.id
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      }
      const statsResponse = await axios.request(teamStatsOptions);
      const stats = statsResponse.data.response;

      let logoUrl, venueImageUrl;
      if (team.team.logo) {
        logoUrl = await downloadImage(team.team.logo, team.team.id, 'logo');
      }
      if (team.venue.image) {
        venueImageUrl = await downloadImage(team.venue.image, team.team.id, 'venue');
      }

      await Team.upsert({
        id: team.team.id,
        name: team.team.name,
        code: team.team.code,
        logoUrl: logoUrl,
        venueName: team.venue.name,
        venueAddress: team.venue.address,
        venueCity: team.venue.city,
        venueCapacity: team.venue.capacity,
        venueImage: venueImageUrl,
        competitionId: stats.league.id,
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
        points: calculatePoints(stats.fixtures.wins.total, stats.fixtures.draws.total, stats.fixtures.loses.total),
        form: stats.fixtures.form,
        goalsFor: stats.goals.for.total.total,
        goalsAgainst: stats.goals.against.total.total,
        goalDifference: stats.goals.for.total.total - stats.goals.against.total.total
      });
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des données:', error);
  }
}

async function updateTeamsRanking() {
  try {
    const options = {
      method: 'GET',
      url: apiBaseUrl + 'standings',
      params: {
        season: '2023',
        league: '61'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    const teams = response.data.response[0].league.standings[0]
    console.log(teams)
    for (const team of teams) {
      await Team.update({
        position: team.rank,
      }, {
        where: { id: team.team.id }
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
  // cron.schedule('33 00 * * *', updateTeamsRanking)
}

module.exports = { runCronJob, updateTeams, updateMatches, updateTeamsRanking };