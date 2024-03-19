const {Bet, Match} = require("../models");
const {Op} = require("sequelize");
const {getMonthDateRange} = require("../controllers/appController");
const {getCurrentMonthMatchdays} = require("../controllers/matchController");

async function checkupBets() {
  try {
    const bets = await Bet.findAll();
    for (const bet of bets) {
      const match = await Match.findByPk(bet.matchId)
      if (!match) continue;
      let points = 0;
      console.log(match.winnerId, bet.winnerId);
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
      // await Bets.update({points}, {where: {id: bet.id}});
    }
  } catch (error) {
    console.log('Erreur lors de la mise à jour des paris:', error);
  }
}

const getMonthPoints = async (seasonId, userId) => {
  try {
    const getMonthMatchdays = await getCurrentMonthMatchdays(seasonId);
    const bets = await Bet.findAll({
      where: {
        seasonId: {
          [Op.eq]: seasonId
        },
        userId: {
          [Op.eq]: userId
        },
        matchday: {
          [Op.in]: getMonthMatchdays
        },
        points: {
          [Op.not]: null
        }
      }
    });
    let points = 0;
    for (const bet of bets) {
      points += bet.points;
    }
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
  }
}

const getSeasonPoints = async (seasonId, userId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        seasonId: {
          [Op.eq]: seasonId
        },
        userId: {
          [Op.eq]: userId
        },
        points: {
          [Op.not]: null
        }
      }
    });
    let points = 0;
    for (const bet of bets) {
      points += bet.points;
    }
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
  }
}

module.exports = {
  checkupBets,
  getMonthPoints,
  getSeasonPoints,
};