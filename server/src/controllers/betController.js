const {Bets, Match} = require("../models");

async function checkupBets() {
  try {
    const bets = await Bets.findAll();
    for (const bet of bets) {
      const match = await Match.findByPk(bet.matchId)
      if (!match) continue;
      let points = 0;
      if (bet.winnerId === match.winner) {
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
      await Bets.update({points}, {where: {id: bet.id}});
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des paris:', error);
  }
}

module.exports = {
  checkupBets,
};