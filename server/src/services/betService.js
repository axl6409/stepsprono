// server/src/services/betService.js
const { Op } = require('sequelize');
const { Bet, Match, Team } = require('../models');
const logger = require('../utils/logger/logger');

exports.getBets = async ({ offset, limit }) => {
  const bets = await Bet.findAndCountAll({
    offset,
    limit,
    include: [{ model: Team, as: 'Winner' }],
  });
  return {
    data: bets.rows,
    totalPages: limit ? Math.ceil(bets.count / limit) : 1,
    currentPage: offset / limit + 1,
    totalCount: bets.count,
  };
};

exports.getNullBets = async () => {
  try {
    return await Bet.findAll({
      where: { points: { [Op.eq]: null } },
      include: [
        {
          model: Match,
          as: 'MatchId',
          include: [
            { model: Team, as: 'HomeTeam' },
            { model: Team, as: 'AwayTeam' },
          ],
        },
      ],
    });
  } catch (error) {
    console.log('Erreur lors de la recuperation des paris nuls:', error);
  }
};

exports.createBet = async ({ userId, seasonId, competitionId, matchday, matchId, winnerId, homeScore, awayScore, scorer }) => {
  const match = await Match.findOne({ where: { id: matchId } });
  if (!match) throw new Error('Match non trouvé');

  const existingBet = await Bet.findOne({ where: { userId, matchId } });
  if (existingBet) throw new Error('Un prono existe déjà pour ce match');

  if (winnerId === null && homeScore !== awayScore) {
    throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
  } else if (winnerId !== null) {
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
    playerGoal: scorer,
  });

  return bet;
};

exports.updateBet = async ({ id, userId, matchId, winnerId, homeScore, awayScore, scorer }) => {
  logger.info('updateBet', { id, userId, matchId, winnerId, homeScore, awayScore, scorer });
  try {
    const match = await Match.findOne({ where: { id: matchId } });
    if (!match) throw new Error('Match non trouvé');

    const bet = await Bet.findByPk(id);
    if (!bet) throw new Error('Pronostic non trouvé');

    const updatedFields = {};
    if (winnerId !== undefined) updatedFields.winnerId = winnerId;
    if (homeScore !== undefined) updatedFields.homeScore = homeScore;
    if (awayScore !== undefined) updatedFields.awayScore = awayScore;
    if (scorer !== undefined) updatedFields.playerGoal = scorer;

    if (winnerId === null && homeScore !== awayScore) {
      throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
    } else if (winnerId !== null) {
      if ((winnerId === match.homeTeamId && parseInt(homeScore) <= parseInt(awayScore)) ||
        (winnerId === match.awayTeamId && parseInt(awayScore) <= parseInt(homeScore))) {
        throw new Error('Le score doit être en rapport avec l\'équipe gagnante désignée');
      }
    }

    await bet.update(updatedFields);
    return bet;
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du prono:', error);
    throw error;
  }
};

exports.getUserBets = async (userId, matchIds) => {
  const bets = await Bet.findAll({
    where: {
      userId,
      matchId: { [Op.in]: matchIds },
    },
  });
  return bets;
};

exports.deleteBet = async (betId) => {
  const bet = await Bet.findByPk(betId);
  if (!bet) throw new Error('Équipe non trouvée');
  await bet.destroy();
};

exports.checkupBets = async () => {
  const bets = await this.getNullBets();
  for (const bet of bets) {
    await this.checkBetByMatchId(bet.id);
  }
};

exports.checkBetByMatchId = async (betId) => {
  try {
    const whereClause = { points: { [Op.eq]: null } };
    if (Array.isArray(betId)) {
      whereClause.id = { [Op.in]: betId };
    } else {
      whereClause.id = betId;
    }

    const bets = await Bet.findAll({ where: whereClause });
    if (bets.length === 0) {
      return { success: true, message: 'Aucun pari à mettre à jour.' };
    }

    let betsUpdated = 0;
    for (const bet of bets) {
      const match = await Match.findByPk(bet.matchId);
      if (!match) {
        return { success: false, message: 'Match non trouvé.' };
      }
      if (match.status !== 'FT') {
        return { success: false, message: 'Le match n\'est pas fini.' };
      }
      let points = 0;
      if (bet.winnerId === match.winnerId) {
        points += 1;
      }
      if (bet.homeScore !== null && bet.awayScore !== null) {
        if (match.goalsHome === bet.homeScore && match.goalsAway === bet.awayScore) {
          points += 3;
        }
      }
      if (bet.playerGoal) {
        const matchScorers = JSON.parse(match.scorers || '[]');
        const scorerFound = matchScorers.some((scorer) => scorer.playerId === bet.playerGoal);
        if (scorerFound) {
          points += 1;
        }
      }
      await Bet.update({ points }, { where: { id: bet.id } });
      betsUpdated++;
    }

    return { success: true, message: `${betsUpdated} pronostics ont été mis à jour.`, updatedBets: betsUpdated };
  } catch (error) {
    console.log('Erreur lors de la mise à jour des pronostics :', error);
    return { success: false, message: 'Une erreur est survenue lors de la mise à jour des pronostics.', error: error.message };
  }
};
