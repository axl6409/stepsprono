const {Op} = require("sequelize");
const {Bet, Match} = require("../models");
const {getCurrentMonthMatchdays} = require("../services/matchService");
const logger = require("../utils/logger/logger");

const checkupBets = async (matchId) => {
  if (matchId) {
    await checkBetByMatchId()
  }
}

const getNullBets = async () => {
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

const getWeekPoints = async (seasonId, userId, matchday) => {
  try {
    const matchdays = matchday;
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
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
    return 0;
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
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
    return 0;
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
    return 0;
  }
}

const calculatePoints = (wins, draws, loses) => {
  return (wins * 3) + draws;
}

const checkBetByMatchId = async (matchId) => {
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

const createBet = async ({ userId, seasonId, competitionId, matchday, matchId, winnerId, homeScore, awayScore, scorer }) => {
  const match = await Match.findOne({
    where: { id: matchId },
  });
  if (!match) {
    throw new Error('Match non trouvé');
  }
  const existingBet = await Bet.findOne({
    where: {
      userId: userId,
      matchId: matchId
    }
  });
  if (existingBet) {
    throw new Error('Un prono existe déjà pour ce match');
  }
  if (winnerId === null) {
    if (homeScore !== awayScore) {
      throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
    }
  } else {
    if ((winnerId === match.homeTeamId && parseInt(homeScore) <= parseInt(awayScore)) ||
      (winnerId === match.awayTeamId && parseInt(awayScore) <= parseInt(homeScore))) {
      throw new Error('Le score doit être en rapport avec l\'équipe gagnante désignée');
    }
  }
  const bet = await Bet.create({
    userId,
    seasonId,
    competitionId,
    matchday,
    matchId,
    winnerId,
    homeScore,
    awayScore,
    playerGoal:scorer
  });
  return bet;
};

const updateBet = async ({ id, userId, matchId, winnerId, homeScore, awayScore, scorer }) => {
  logger.info('updateBet', { id, userId, matchId, winnerId, homeScore, awayScore, scorer });
  try {
    const match = await Match.findOne({
      where: { id: matchId },
    });
    if (!match) {
      throw new Error('Match non trouvé');
    }
    const bet = await Bet.findByPk(id);
    if (!bet) {
      logger.error('Pronostic non trouvé');
      throw new Error('Pronostic non trouvé');
    }
    const updatedFields = {};
    if (winnerId !== undefined) updatedFields.winnerId = winnerId;
    if (homeScore !== undefined) updatedFields.homeScore = homeScore;
    if (awayScore !== undefined) updatedFields.awayScore = awayScore;
    if (scorer !== undefined) updatedFields.playerGoal = scorer;

    if (winnerId === null) {
      if (homeScore !== awayScore) {
        throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
      }
    } else {
      if ((winnerId === match.homeTeamId && parseInt(homeScore) <= parseInt(awayScore)) ||
        (winnerId === match.awayTeamId && parseInt(awayScore) <= parseInt(homeScore))) {
        throw new Error('Le score doit être en rapport avec l\'équipe gagnante désignée');
      }
    }
    await bet.update(updatedFields);
    return bet;
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du prono: ', error);
    throw error;
  }
}

module.exports = {
  calculatePoints,
  checkBetByMatchId,
  checkupBets,
  getNullBets,
  getWeekPoints,
  getMonthPoints,
  getSeasonPoints,
  createBet,
  updateBet,
};