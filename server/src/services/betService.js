const {Op} = require("sequelize");
const {Bet, Match} = require("../models");

function calculatePoints(wins, draws, loses) {
  return (wins * 3) + draws;
}

async function checkBetByMatchId(matchId) {
  try {
    const whereClause = {
      points: {
        [Op.eq]: null
      }
    };
    if (matchId) {
      whereClause.matchId = matchId;
    }
    const bets = await Bet.findAll({
      where: whereClause
    });
    if (bets.length === 0) {
      return { success: true, message: "Aucun pari à mettre à jour." };
    }
    let betsUpdated = 0;
    for (const bet of bets) {
      const match = await Match.findByPk(bet.matchId)
      if (!match) continue;
      let points = 0;
      if (bet.winnerId === match.winnerId) {
        points += 1;
      }
      if (match.goalsHome === bet.homeScore && match.goalsAway === bet.awayScore) {
        points += 3;
      }
      if (bet.playerGoal) {
        const matchScorers = JSON.parse(match.scorers || '[]');
        const scorerFound = matchScorers.some(scorer => scorer.playerId === bet.playerGoal);
        if (scorerFound) {
          points += 1;
        }
      }
      await Bet.update({points}, {where: {id: bet.id}});
      betsUpdated++;
    }
    return { success: true, message: `${betsUpdated} pronostics ont été mis à jour.`, updatedBets: betsUpdated };
  } catch (error) {
    console.log('Erreur lors de la mise à jour des pronostics :', error);
    return { success: false, message: "Une erreur est survenue lors de la mise à jour des pronostics.", error: error.message };
  }
}

module.exports = {
  calculatePoints,
  checkBetByMatchId
};