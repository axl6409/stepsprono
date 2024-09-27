const {Op} = require("sequelize");
const {Bet, Match, Team, Player, User} = require("../models");
const {getCurrentWeekMatchdays, getCurrentMonthMatchdays, getClosestPastMatchday} = require("./appService");
const logger = require("../utils/logger/logger");
const {getCurrentSeasonId} = require("./seasonService");
const eventBus = require("../events/eventBus");
const sequelize = require("../../database");
const {getCurrentCompetitionId} = require("./competitionService");
const moment = require("moment-timezone");

/**
 * Checks up on bets based on their IDs. If an array of IDs is provided, checks each ID individually.
 * If a single ID is provided, checks that ID. Returns a success message if all bets are verified successfully,
 * or an error message if there is an issue with any of the bets. If no bet IDs are provided, returns an error message.
 *
 * @param {number|Array<number>} betId - The ID(s) of the bet(s) to check. Can be a single number or an array of numbers.
 * @return {Promise<Object>} An object with a success property (true if all bets are verified successfully, false otherwise),
 * a message property (a success message if all bets are verified successfully, an error message otherwise),
 * and an error property (the error message if there is an issue with any of the bets, undefined otherwise).
 */
const checkupBets = async (betId) => {
  try {
    if (betId) {
      if (Array.isArray(betId)) {
        for (const id of betId) {
          const result = await checkBetByMatchId(id);
          if (!result.success) {
            return { success: false, message: result.message };
          }
        }
      } else {
        const result = await checkBetByMatchId(betId);
        if (!result.success) {
          return { success: false, message: result.message };
        }
      }
      return { success: true, message: "Pronostics vérifiés avec succès." };
    }
    return { success: false, message: "Aucun identifiant de pronostic fourni." };
  } catch (error) {
    logger.info('Erreur lors de la vérification des pronostics:', error);
    return { success: false, message: "Une erreur est survenue lors de la vérification des pronostics.", error: error.message };
  }
};

/**
 * Retrieves all bets with null points from the database, along with their associated match and teams.
 *
 * @return {Promise<Array<Object>>} An array of bet objects with null points, each containing a match object and its associated teams. Returns an empty array if there was an error.
 */
const getNullBets = async () => {
  try {
    return await Bet.findAll({
      where: {
        points: {
          [Op.eq]: null
        }
      },
      include: [{
        model: Match,
        as: 'MatchId',
        // where: {
        //   status: 'FT'
        // },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      }]
    });
  } catch (error) {
    console.log('Erreur lors de la recuperation des paris nuls:', error);
  }
}

/**
 * Retrieves the total points earned by a user for the last matchday of a season.
 *
 * @param {number} seasonId - The ID of the season.
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the last matchday. Returns 0 if there was an error.
 */
const getLastMatchdayPoints = async (seasonId, userId) => {
  try {
    const matchday = await getClosestPastMatchday(seasonId);
    logger.info('Matchday:', matchday);
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
        points: { [Op.not]: null }
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          matchday: {
            [Op.eq]: matchday
          }
        }
      }]
    });

    let points = 0;
    for (const bet of bets) {
      points += bet.points;
    }
    logger.info('Points:', points);
    return points;
  } catch (error) {
    console.log('Erreur lors de la récupération des points pour la dernière journée:', error);
    return 0;
  }
}

/**
 * Retrieves the total points earned by a user for a specific week of a season.
 *
 * @param {number} seasonId - The ID of the season.
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the week. Returns 0 if there was an error.
 */
const getWeekPoints = async (seasonId, userId) => {
  try {
    const matchdays = await getCurrentWeekMatchdays(seasonId);
    console.log('Matchdays for the week:', matchdays);
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
        matchday: {
          [Op.in]: matchdays
        },
        points: {
          [Op.not]: null
        }
      }
    });
    let points = 0;
    console.log('bets => ' + bets)
    for (const bet of bets) {
      points += bet.points;
    }
    console.log(`Total points for user ${userId} in week:`, points);
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
    return 0;
  }
}

/**
 * Retrieves the total points earned by a user for a specific month of a season.
 *
 * @param {number} seasonId - The ID of the season.
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the month. Returns 0 if there was an error.
 */
const getMonthPoints = async (seasonId, userId) => {
  try {
    const matchdays = await getCurrentMonthMatchdays(seasonId);
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
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

/**
 * Retrieves the total points earned by a user for a specific season.
 *
 * @param {number} seasonId - The ID of the season.
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the season. Returns 0 if there was an error.
 */
const getSeasonPoints = async (seasonId, userId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
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

/**
 * Calculates the total points based on the number of wins, draws, and losses.
 *
 * @param {number} wins - The number of wins.
 * @param {number} draws - The number of draws.
 * @param {number} loses - The number of losses.
 * @return {number} The total points.
 */
const calculatePoints = (wins, draws, loses) => {
  return (wins * 3) + draws;
}

/**
 * Updates a bet with the given parameters.
 *
 * @param {Object} options - The options for updating the bet.
 * @param {string} options.id - The ID of the bet to update.
 * @param {string} options.userId - The ID of the user making the bet.
 * @param {string} options.matchId - The ID of the match associated with the bet.
 * @param {string|null} options.winnerId - The ID of the winning team, or null for a draw.
 * @param {number|null} options.homeScore - The score of the home team, or null if not applicable.
 * @param {number|null} options.awayScore - The score of the away team, or null if not applicable.
 * @param {string|null} options.scorer - The ID of the scorer, or null if not applicable.
 * @throws {Error} If the match is not found, or if the updated bet is invalid.
 * @return {Promise<Object>} The updated bet object.
 */
const checkBetByMatchId = async (ids) => {
  try {
    let bets;
    if (Array.isArray(ids)) {
      bets = await Bet.findAll({
        where: {
          [Op.or]: [
            { match_id: { [Op.in]: ids } },
            { id: { [Op.in]: ids } },
          ],
          points: { [Op.eq]: null }
        }
      });
    } else {
      bets = await Bet.findAll({
        where: {
          [Op.or]: [
            { match_id: ids },
            { id: ids },
          ],
          points: { [Op.eq]: null }
        }
      });
    }

    if (bets.length === 0) {
      logger.info("Aucun pronostic à mettre à jour.");
      return { success: true, message: "Aucun pronostic à mettre à jour." };
    }

    let betsUpdated = 0;
    for (const bet of bets) {
      const match = await Match.findByPk(bet.match_id);
      if (!match) {
        logger.info("Match non trouvé.");
        return { success: false, message: "Match non trouvé." };
      }
      if (match.status !== 'FT') {
        logger.info("Le match n'est pas fini.");
        return { success: false, message: "Le match n'est pas fini." };
      }
      let points = 0;
      if (bet.winner_id === match.winner_id) {
        points += 1;
      }
      if (bet.home_score !== null && bet.away_score !== null) {
        if (match.goals_home === bet.home_score && match.goals_away === bet.away_score) {
          points += 3;
        }
      }
      if (bet.player_goal) {
        const matchScorers = JSON.parse(match.scorers || '[]');
        const scorerFound = matchScorers.some(scorer => scorer.playerId === bet.player_goal);
        logger.info("matchScorers:", matchScorers);
        logger.info("scorerFound:", scorerFound);
        if (scorerFound) {
          points += 1;
        }
      }
      await Bet.update({ points }, { where: { id: bet.id } });
      betsUpdated++;
    }
    logger.info(`Pronostics mis à jour : ${betsUpdated}`);
    eventBus.emit('betsChecked');
    return { success: true, message: `${betsUpdated} pronostics ont été mis à jour.`, updatedBets: betsUpdated };
  } catch (error) {
    logger.error("Erreur lors de la mise à jour des pronostics :", error);
    return { success: false, message: "Une erreur est survenue lors de la mise à jour des pronostics.", error: error.message };
  }
};

/**
 * Creates a bet with the given parameters.
 *
 * @param {Object} options - The options for creating the bet.
 * @param {string} options.userId - The ID of the user making the bet.
 * @param {number} options.matchday - The matchday of the bet.
 * @param {string} options.matchId - The ID of the match associated with the bet.
 * @param {string|null} options.winnerId - The ID of the winning team, or null for a draw.
 * @param {number|null} options.homeScore - The score of the home team, or null if not applicable.
 * @param {number|null} options.awayScore - The score of the away team, or null if not applicable.
 * @param {string|null} options.scorer - The ID of the scorer, or null if not applicable.
 * @throws {Error} If the match is not found, or if the created bet is invalid.
 * @return {Promise<Object>} The created bet object.
 */
const createBet = async ({ userId, matchday, matchId, winnerId, homeScore, awayScore, scorer }) => {
  try {
    logger.info('DATAS =>', { userId, matchday, matchId, winnerId, homeScore, awayScore, scorer });
    const match = await Match.findOne({
      where: {id: matchId},
    });
    if (!match) {
      throw new Error('Match non trouvé');
    }
    const existingBet = await Bet.findOne({
      where: {
        user_id: userId,
        match_id: matchId
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
      if ((winnerId === match.home_team_id && parseInt(homeScore) <= parseInt(awayScore)) || (winnerId === match.away_team_id && parseInt(awayScore) <= parseInt(homeScore))) {
        throw new Error('Le score doit être en rapport avec l\'équipe gagnante désignée');
      }
    }
    const competitionId = 61
    const seasonId = await getCurrentSeasonId(competitionId);

    console.log("Scorer => ", scorer);
    const bet = await Bet.create({
      user_id: userId,
      season_id: seasonId,
      competition_id: competitionId,
      matchday: matchday,
      match_id: matchId,
      winner_id: winnerId,
      home_score: homeScore,
      away_score: awayScore,
      player_goal: scorer ? scorer : null
    });
    return bet;
  } catch (error) {
    logger.error('Erreur lors de la creation du pronostic :', error);
    throw error;
  }
};

/**
 * Updates a bet with the given parameters.
 *
 * @param {Object} options - The options for updating the bet.
 * @param {string} options.id - The ID of the bet to update.
 * @param {string} options.userId - The ID of the user making the bet.
 * @param {string} options.matchId - The ID of the match associated with the bet.
 * @param {string|null} options.winnerId - The ID of the winning team, or null for a draw.
 * @param {number|null} options.homeScore - The score of the home team, or null if not applicable.
 * @param {number|null} options.awayScore - The score of the away team, or null if not applicable.
 * @param {string|null} options.scorer - The ID of the scorer, or null if not applicable.
 * @throws {Error} If the match is not found, or if the updated bet is invalid.
 * @return {Promise<Object>} The updated bet object.
 */
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
    if (winnerId !== undefined) updatedFields.winner_id = winnerId;
    if (homeScore !== undefined) updatedFields.home_score = homeScore;
    if (awayScore !== undefined) updatedFields.away_score = awayScore;
    if (scorer !== undefined) updatedFields.player_goal = scorer;

    if (winnerId === null) {
      if (homeScore !== awayScore) {
        throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
      }
    } else {
      if ((winnerId === match.home_team_id && parseInt(homeScore) <= parseInt(awayScore)) ||
        (winnerId === match.away_team_id && parseInt(awayScore) <= parseInt(homeScore))) {
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

const getLastBetsByUserId = async (userId) => {
  // const now = moment().set({ 'year': 2024, 'month': 7, 'date': 13 });
  const now = moment();
  const startOfWeek = now.clone().startOf('isoWeek');
  const endOfWeek = now.clone().endOf('isoWeek');

  const startDate = startOfWeek.toDate();
  const endDate = endOfWeek.toDate();

  const bets = await Bet.findAll({
    include: [
      {
        model: Match,
        as: 'MatchId',
        where: {
          utc_date: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      },
      {
        model: Player,
        as: 'PlayerGoal'
      }
    ],
    where: {
      user_id: userId
    }
  });
  return bets;
}

const getAllLastBets = async () => {
  // const now = moment().set({ 'year': 2024, 'month': 7, 'date': 13 });
  const now = moment();
  const startOfWeek = now.clone().startOf('isoWeek');
  const endOfWeek = now.clone().endOf('isoWeek');

  const startDate = startOfWeek.toDate();
  const endDate = endOfWeek.toDate();

  const bets = await Bet.findAll({
    include: [
      {
        model: Match,
        as: 'MatchId',
        where: {
          utc_date: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      },
      {
        model: Player,
        as: 'PlayerGoal'
      },
      {
        model: User,
        as: 'UserId'
      }
    ],
  });
  return bets;
}

module.exports = {
  calculatePoints,
  checkBetByMatchId,
  checkupBets,
  getNullBets,
  getLastMatchdayPoints,
  getWeekPoints,
  getMonthPoints,
  getSeasonPoints,
  createBet,
  updateBet,
  getLastBetsByUserId,
  getAllLastBets,
};