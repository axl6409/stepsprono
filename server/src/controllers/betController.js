const {Bet, Match} = require("../models");
const {Op} = require("sequelize");
const {getMonthDateRange} = require("../controllers/appController");
const {getCurrentMonthMatchdays} = require("../controllers/matchController");

async function checkupBets(matchId) {
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

async function getNullBets() {
  try {
    const bets = await Bet.findAll({
      where: {
        points: {
          [Op.eq]: null
        }
      }
    });
    return bets.length !== 0;
  } catch (error) {
    console.log('Erreur lors de la recuperation des paris nuls:', error);
  }
}

const getMonthPoints = async (seasonId, userId) => {
  try {
    const matchdays = await getCurrentMonthMatchdays(seasonId);
    const bets = await Bet.findAll({
      where: {
        seasonId: {
          [Op.eq]: seasonId
        },
        userId: {
          [Op.eq]: userId
        },
        matchday: {
          [Op.in]: matchdays
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
    return bets;
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
  getNullBets,
  getMonthPoints,
  getSeasonPoints,
};