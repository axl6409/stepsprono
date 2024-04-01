const {Bet, Match} = require("../models");
const {Op} = require("sequelize");
const {getMonthDateRange} = require("../controllers/appController");
const {getCurrentMonthMatchdays} = require("../controllers/matchController");
const {checkBetByMatchId} = require("../services/betService");

async function checkupBets(matchId) {
  if (matchId) {
    await checkBetByMatchId()
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