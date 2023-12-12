const cron = require('node-cron')

const { updateTeams, updateTeamsRanking } = require('./src/controllers/teamController')
const { updateMatches, updateMatchStatusAndPredictions, fetchWeekMatches } = require('./src/controllers/matchController')
const { checkupBets } = require('./src/controllers/betController')
const { updatePlayers } = require('./src/controllers/playerController')

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

const runCronJob = () => {
  cron.schedule('01 00 2 2 *', updateTeams) // Mercato winter
  cron.schedule('01 00 2 6 *', updateTeams) // Mercato summer
  cron.schedule('03 00 * * *', updatePlayers)
  cron.schedule('05 00 * * *', updateTeamsRanking)
  cron.schedule('07 00 * * *', updateMatches)
  cron.schedule('30 00 * * 1', fetchWeekMatches)
}

module.exports = { runCronJob, updateTeams, updateTeamsRanking, updateMatches, fetchWeekMatches, updateMatchStatusAndPredictions, updatePlayers, checkupBets };