const cron = require('node-cron')
const axios = require('axios');
const { Match, Team, Area, Bets, Players} = require('./src/models');
const ProgressBar = require('progress');
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const {Op} = require("sequelize");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

function levenshtein(a, b) {
  const an = a ? a.length : 0; // Longueur de la chaîne 'a', ou 0 si 'a' est vide
  const bn = b ? b.length : 0; // Longueur de la chaîne 'b', ou 0 si 'b' est vide
  if (an === 0) return bn; // Si 'a' est vide, retourne la longueur de 'b'
  if (bn === 0) return an; // Si 'b' est vide, retourne la longueur de 'a'
  const matrix = new Array(bn + 1); // Crée une matrice de taille (bn + 1)
  for (let i = 0; i <= bn; ++i) {
    let row = matrix[i] = new Array(an + 1); // Initialise chaque ligne de la matrice
    row[0] = i; // Initialise la première colonne de chaque ligne
  }
  const firstRow = matrix[0]; // Référence à la première ligne de la matrice
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j; // Initialise la première ligne de la matrice
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      const cost = a.charAt(j - 1) === b.charAt(i - 1) ? 0 : 1; // Coût de substitution, 0 si les caractères sont identiques, sinon 1
      // Calcule le coût minimum pour chaque cellule de la matrice
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[bn][an]; // Retourne le coût de Levenshtein à partir de la dernière cellule de la matrice
}

function calculatePoints(wins, draws, loses) {
  return (wins * 3) + draws;
}

function getRelativePath(pathToFile) {
  const basePath = path.join(__dirname, '../client/src');
  return pathToFile.replace(basePath, '');
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
      writer.on('finish', () => resolve(getRelativePath(pathToFile)));
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
        form: stats.form,
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

async function fetchWeekendMatches() {
  try {
    const today = moment().tz("Europe/Paris");
    const nextFriday = today.clone().isoWeekday(5)
    if (today.isoWeekday() > 5) {
      nextFriday.add(1, 'weeks')
    }
    const nextSunday = nextFriday.clone().add(2, 'days')
    const startDate = nextFriday.format('YYYY-MM-DD 00:00:00')
    const endDate = nextSunday.format('YYYY-MM-DD 23:59:59')
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
      const updateTime = new Date(matchTime.getTime() + 120 * 60000); // Ajoute 120 minutes
      const day = updateTime.getDate();
      const month = updateTime.getMonth() + 1;
      const hour = updateTime.getHours();
      const minute = updateTime.getMinutes();
      const cronTime = `${minute} ${hour} ${day} ${month} *`;
      console.log(cronTime + ' | ' + match.id)
      cron.schedule(cronTime, () => updateMatchStatusAndPredictions(match.id))
    });
  } catch (error) {
    console.log('Erreur lors de la récupération des matchs du weekend:', error);
  }
}

async function updateMatchStatusAndPredictions(matchId) {
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
    const dbMatchData = await Match.findByPk(matchId);
    if (dbMatchData && apiMatchData) {
      const fieldsToUpdate = {};
      if (dbMatchData['status'] !== apiMatchData.fixture.status.short) {
        fieldsToUpdate['status'] = apiMatchData.fixture.status.short
      }
      if (apiMatchData.teams.home.winner === true) {
        fieldsToUpdate['winner'] = apiMatchData.teams.home.id
      } else if (apiMatchData.teams.away.winner === true) {
        fieldsToUpdate['winner'] = apiMatchData.teams.away.id
      } else {
        fieldsToUpdate['winner'] = null
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

      if (Object.keys(fieldsToUpdate).length > 0) {
        fieldsToUpdate['updatedAt'] = new Date();
        await Match.update(fieldsToUpdate, { where: { id: matchId } });
      }

      for (const goals of apiMatchData.events) {
        if (goals.type === 'Goal') {
          console.log(goals.player.name)
          events.push({
            player: goals.player.name,
          });
        }
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        // Récupérer tous les pronostics pour ce match
        const bets = await Bets.findAll({ where: { matchId } });
        for (const bet of bets) {
          let points = 0;
          console.log(bet.winnerId === fieldsToUpdate['winner'])
          if (bet.winnerId && bet.winnerId === fieldsToUpdate['winner']) {
            points += 1;
          }
          if (bet.homeScore === apiMatchData.score.fulltime.home && bet.awayScore === apiMatchData.score.fulltime.away) {
            points += 3;
          }
          if (bet.playerGoal) {
            for (const event of events) {
              const trimmedPlayerName = event.player.split(' ');
              console.log(trimmedPlayerName)
              console.log(event.player.toLowerCase())
              const similarity = levenshtein(bet.playerGoal.toLowerCase(), trimmedPlayerName);
              const maxLength = Math.max(bet.playerGoal.length, trimmedPlayerName.length);
              const similarityPercentage = ((maxLength - similarity) / maxLength) * 100;
              console.log(similarityPercentage)
              if (similarityPercentage >= 70) {
                points += 1;
                break;
              }
            }
          }
          await Bets.update({ points }, { where: { id: bet.id } });
        }
      }
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour du match et des pronostics:', error);
  }
}

async function updatePlayers() {
  try {
    const teams = await Team.findAll()
    for (const team of teams) {
      const options = {
        method: 'GET',
        url: `${apiBaseUrl}players/`,
        params: {
          team: `${team.id}`,
          season: '2023',
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost
        }
      };
      const response = await axios.request(options);
      const apiMatchData = response.data.response;
      for (const apiPlayer of apiMatchData) {
        await Players.upsert({
          id: apiPlayer.player.id,
          name: apiPlayer.player.name,
          firstName: apiPlayer.player.firstname,
          lastName: apiPlayer.player.lastname,
          teamId: apiPlayer.statistics[0].team.id,
        })
      }
    }
  } catch (error) {
    console.log(`Erreur lors de le récupération des joueurs pour l'équipe ${teamId}:`, error);
  }
}

const runCronJob = () => {
  cron.schedule('01 00 2 2 *', updateTeams) // Mercato winter
  cron.schedule('01 00 2 6 *', updateTeams) // Mercato summer
  cron.schedule('03 00 * * *', updatePlayers)
  cron.schedule('05 00 * * *', updateTeamsRanking)
  cron.schedule('07 00 * * *', updateMatches)
  cron.schedule('30 00 * * 1', fetchWeekendMatches)
}

module.exports = { runCronJob, updateTeams, updateTeamsRanking, updateMatches, fetchWeekendMatches, updateMatchStatusAndPredictions, updatePlayers };