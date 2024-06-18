// server/src/services/betService.js
const { Op } = require('sequelize');
const { Bet, Match, Team } = require('../models');
const logger = require('../utils/logger/logger');

/**
 * Retrieves a list of bets with pagination information.
 *
 * @param {number} offset - The starting index of the bets to retrieve.
 * @param {number} limit - The maximum number of bets to retrieve.
 * @return {object} An object containing data array of bets, total pages, current page, and total count.
 */
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

/**
 * Retrieves all null bets with associated match and team information.
 *
 * @return {Promise<Array>} An array of null bets with detailed match and team information.
 */
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

/**
 * Creates a new bet entry based on the provided information.
 *
 * @param {Object} userId - The ID of the user placing the bet.
 * @param {number} seasonId - The ID of the season.
 * @param {number} competitionId - The ID of the competition.
 * @param {number} matchday - The matchday number.
 * @param {number} matchId - The ID of the match for the bet.
 * @param {number} winnerId - The ID of the winning team or null for a draw.
 * @param {number} homeScore - The score of the home team.
 * @param {number} awayScore - The score of the away team.
 * @param {string} scorer - The ID of the player who scored.
 * @return {Object} The newly created bet entry.
 */
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

/**
 * Updates a bet entry with the provided information.
 *
 * @param {Object} id - The ID of the bet to update.
 * @param {Object} userId - The ID of the user updating the bet.
 * @param {Object} matchId - The ID of the match associated with the bet.
 * @param {Object} winnerId - The ID of the winning team or null for a draw.
 * @param {Object} homeScore - The score of the home team in the bet.
 * @param {Object} awayScore - The score of the away team in the bet.
 * @param {Object} scorer - The ID of the player who scored in the bet.
 * @return {Object} The updated bet entry.
 */
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

/**
 * Retrieves all bets for a specific user and set of match IDs.
 *
 * @param {type} userId - The ID of the user.
 * @param {type} matchIds - An array of match IDs.
 * @return {type} An array of bets matching the criteria.
 */
exports.getUserBets = async (userId, matchIds) => {
  const bets = await Bet.findAll({
    where: {
      userId,
      matchId: { [Op.in]: matchIds },
    },
  });
  return bets;
};

/**
 * Deletes a bet entry by the provided betId.
 *
 * @param {number} betId - The ID of the bet to delete.
 * @return {Promise<void>} Promise that resolves after deleting the bet.
 */
exports.deleteBet = async (betId) => {
  const bet = await Bet.findByPk(betId);
  if (!bet) throw new Error('Équipe non trouvée');
  await bet.destroy();
};

/**
 * Retrieves null bets and checks each bet by match ID.
 *
 * @return {Promise<void>} Promise that resolves after checking all bets.
 */
exports.checkupBets = async () => {
  const bets = await this.getNullBets();
  for (const bet of bets) {
    await this.checkBetByMatchId(bet.id);
  }
};

/**
 * Retrieves bets by match ID, updates points, and returns a message with the number of updated bets.
 *
 * @param {number} betId - The ID of the bet to check.
 * @return {Object} An object containing success status, message, and the number of updated bets.
 */
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
