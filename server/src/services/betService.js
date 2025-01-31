const {Op} = require("sequelize");
const {Bet, Match, Team, Player, User, Setting, UserRanking} = require("../models");
const {getCurrentWeekMatchdays, getCurrentMonthMatchdays, getWeekDateRange, getMonthDateRange} = require("./appService");
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
        where: {
          status: 'FT'
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
const getLastMatchdayPoints = async (userId) => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
    const matchday = await getClosestPastMatchday(seasonId);

    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
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

    return points;
  } catch (error) {
    console.log('Erreur lors de la récupération des points pour la dernière journée:', error);
    return 0;
  }
}

/**
 * Retrieves the total points earned by a user for a specific week of a season.
 *
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the week. Returns 0 if there was an error.
 */
const getWeekPoints = async (userId) => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
    const matchdays = await getCurrentWeekMatchdays();
    const date = getWeekDateRange();

    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
        created_at: {
          [Op.gte]: date.start,
          [Op.lte]: date.end
        }
      }
    });
    let points = 0;

    for (const bet of bets) {
      points += bet.points;
    }
    logger.info(`Total points for user ${userId} in week:`, points);
    return points;
  } catch (error) {
    logger.error('Erreur lors de la recuperation des points:', error);
    return 0;
  }
}

/**
 * Retrieves the total points earned by a user for a specific month of a season.
 *
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the month. Returns 0 if there was an error.
 */
const getMonthPoints = async (userId) => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
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
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The total points earned by the user for the season. Returns 0 if there was an error.
 */
const getSeasonPoints = async (userId) => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
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
 * Récupère le classement des utilisateurs pour une saison donnée
 * @param {number} seasonId - L'ID de la saison
 * @return {Promise<Array>} Le classement des utilisateurs avec leurs points
 */
const getSeasonRanking = async (seasonId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        points: { [Op.not]: null }
      },
      include: [
        {
          model: User,
          as: 'UserId',
          attributes: ['id', 'username', 'img']
        }
      ]
    });

    const ranking = await bets.reduce(async (accPromise, bet) => {
      const acc = await accPromise;
      const userId = bet.user_id;
      const username = bet.UserId.username;
      const lastDaymatchdayPoints = await getLastMatchdayPoints(seasonId, userId);

      if (acc[userId]) {
        acc[userId].points += bet.points;
      } else {
        acc[userId] = {
          user_id: userId,
          username: username,
          points: bet.points,
          img: bet.UserId.img,
          lastMatchdayPoints: lastDaymatchdayPoints
        };
      }

      return acc;
    }, Promise.resolve({}));

    const sortedRanking = Object.values(ranking).sort((a, b) => {
      if (b.points === a.points) {
        return b.lastMatchdayPoints - a.lastMatchdayPoints;
      }
      return b.points - a.points;
    });

    return sortedRanking;
  } catch (error) {
    console.error('Erreur lors de la récupération du classement de la saison:', error);
    throw new Error('Erreur lors de la récupération du classement.');
  }
};

/**
 * Retrieves the ranking of users for a given season and period.
 *
 * @param {number} seasonId - The ID of the season.
 * @param {string} period - The period for which to retrieve the ranking ('month', 'week', or 'season').
 * @return {Promise<Array<Object>>} A promise that resolves to an array of user ranking objects, sorted by points.
 * Each object contains user_id, username, points, tie_breaker_points, mode, and img.
 * @throws {Error} If there is an error while retrieving the ranking.
 */
const getRanking = async (seasonId, period) => {
  try {
    const setting = await Setting.findOne({
      where: { key: 'rankingMode' },
      attributes: ['active_option']
    });
    const rankingMode = setting?.active_option;

    let matchdays = [];
    let dateRange = {};
    let excludedMatchIds = [];

    if (period === 'month') {
      const { start, end } = getMonthDateRange();
      matchdays = await getCurrentMonthMatchdays();

      if (matchdays.length > 0) {
        const firstMatchday = matchdays[0];

        const firstMatchdayMatches = await Match.findAll({
          where: {
            matchday: firstMatchday,
            season_id: seasonId
          },
          order: [['utc_date', 'ASC']]
        });

        if (firstMatchdayMatches.length > 1) {
          const matchDates = firstMatchdayMatches.map(m => ({
            id: m.id,
            date: new Date(m.utc_date)
          }));

          const currentYear = new Date(start).getFullYear();
          const currentMonth = new Date(start).getMonth();

          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

          const matchesPreviousMonth = matchDates.filter(m =>
            m.date.getFullYear() === previousYear && m.date.getMonth() === previousMonth
          );

          const matchesCurrentMonth = matchDates.filter(m =>
            m.date.getFullYear() === currentYear && m.date.getMonth() === currentMonth
          );

          logger.info(`📅 Matchs du mois précédent:`, matchesPreviousMonth);
          logger.info(`📅 Matchs du mois en cours:`, matchesCurrentMonth);

          if (matchesPreviousMonth.length > 0 && matchesCurrentMonth.length > 0) {
            const firstCurrentMonthMatch = matchesCurrentMonth[0];

            matchesPreviousMonth.forEach(matchPrev => {
              const diffInDays = Math.abs((firstCurrentMonthMatch.date - matchPrev.date) / (1000 * 60 * 60 * 24));

              if (diffInDays >= 5) {
                logger.info(`🚨 Exclusion du match (ID: ${matchPrev.id}) car il est décalé de ${diffInDays} jours et appartient au mois précédent.`);
                excludedMatchIds.push(matchPrev.id);
              }
            });

            logger.info("📌 Liste des matchs exclus après correction:", excludedMatchIds);
          }
        }
      }
    } else if (period === 'week') {
      const { start, end } = getWeekDateRange();
      dateRange = { created_at: { [Op.between]: [start, end] } };
    }

    logger.info("✅ Liste finale des matchs exclus:", excludedMatchIds);

    const users = await User.findAll({
      attributes: ['id', 'username', 'img']
    });

    const ranking = users.reduce((acc, user) => {
      acc[user.id] = {
        user_id: user.id,
        username: user.username,
        points: 0,
        tie_breaker_points: 0,
        mode: rankingMode,
        img: user.img
      };
      return acc;
    }, {});

    const whereCondition = {
      season_id: seasonId,
      points: { [Op.not]: null },
      ...(period === 'month'
          ? {
            matchday: { [Op.in]: matchdays },
            ...(excludedMatchIds.length > 0 ? { match_id: { [Op.notIn]: excludedMatchIds } } : {})
          }
          : dateRange
      )
    };

    const bets = await Bet.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'UserId',
          attributes: ['id', 'username', 'img']
        }
      ]
    });

    for (const bet of bets) {
      const userId = bet.user_id;
      if (ranking[userId]) {
        ranking[userId].points += bet.points;

        if (rankingMode === 'legit') {
          ranking[userId].tie_breaker_points += bet.result_points;
        } else if (rankingMode === 'history') {
          ranking[userId].tie_breaker_points = await getLastMatchdayPoints(userId);
        }
      }
    }

    const sortedRanking = Object.values(ranking).sort((a, b) => {
      if (b.points === a.points) {
        return b.tie_breaker_points - a.tie_breaker_points;
      }
      return b.points - a.points;
    });

    return sortedRanking;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération du classement pour ${period}:`, error);
    throw new Error('Erreur lors de la récupération du classement.');
  }
};


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
          points: null
        }
      });
    } else {
      bets = await Bet.findAll({
        where: {
          [Op.or]: [
            { match_id: ids },
            { id: ids },
          ],
          points: null
        }
      });
    }
    logger.info('[BETS => ]')
    console.log(ids)
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

      let resultPoints = 0;
      let scorePoints = 0;
      let scorerPoints = 0;

      if (bet.winner_id === match.winner_id) {
        resultPoints = 1;
      }

      if (match.require_details && bet.home_score !== null && bet.away_score !== null) {
        if (match.goals_home === bet.home_score && match.goals_away === bet.away_score) {
          scorePoints = 3;
        }
      }

      if (match.require_details) {
        const matchScorers = JSON.parse(match.scorers || '[]');

        if (bet.player_goal) {
          const scorerFound = matchScorers.some(scorer => {
            const isScorerMatch = String(scorer.playerId) === String(bet.player_goal);
            logger.info(`Vérification du buteur - ID du pronostic: ${bet.player_goal}, ID du buteur: ${scorer.playerId}, Correspondance: ${isScorerMatch}`);
            return isScorerMatch;
          });

          if (scorerFound) {
            scorerPoints = 1;
            logger.info(`Buteur trouvé pour le pronostic ID: ${bet.id}, Points pour buteur: ${scorerPoints}`);
          } else {
            logger.info(`Aucun buteur correspondant pour le pronostic ID: ${bet.id}`);
          }
        } else if (matchScorers.length === 0) {
          scorerPoints = 1;
          logger.info(`Aucun buteur pour le match ID: ${match.id}, et aucun buteur pronostiqué pour le pari ID: ${bet.id}. Attribution d'un point pour buteur par défaut.`);
        }
      }


      const totalPoints = resultPoints + scorePoints + scorerPoints;

      await Bet.update(
        {
          result_points: resultPoints,
          score_points: scorePoints,
          scorer_points: scorerPoints,
          points: totalPoints
        },
        { where: { id: bet.id } }
      );

      betsUpdated++;
    }

    logger.info(`Pronostics mis à jour : ${betsUpdated}`);
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

const getMatchdayRanking = async (matchday) => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const users = await User.findAll();

    const bets = await Bet.findAll({
      where: {
        matchday,
        season_id: seasonId,
      },
      include: [
        {
          model: User,
          as: 'UserId',
        }
      ],
    });

    const ranking = bets.reduce((acc, bet) => {
      const userId = bet.user_id;
      const username = bet.UserId.username;

      const points = bet.points || 0;

      if (acc[userId]) {
        acc[userId].points += bet.points;
      } else {
        acc[userId] = {
          user_id: userId,
          username: username,
          points: bet.points
        };
      }

      return acc;
    }, {});

    users.forEach(user => {
      if (!ranking[user.id]) {
        ranking[user.id] = {
          user_id: user.id,
          username: user.username,
          points: 0
        };
      }
    });

    logger.info('[USERS]')
    console.log(ranking)
    return Object.values(ranking).sort((a, b) => b.points - a.points);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du classement de la journée ${matchday}:`, error);
    return [];
  }
};

const updateAllBetsForCurrentSeason = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const matches = await Match.findAll({
      where: {
        season_id: seasonId,
        status: 'FT',
      },
      attributes: ['id'],
    });

    const matchIds = matches.map(match => match.id);

    if (matchIds.length === 0) {
      console.log("Aucun match trouvé pour la saison en cours.");
      return;
    }

    const result = await checkBetByMatchId(matchIds);
    console.log("Mise à jour des pronostics de la saison :", result.message);
    return { success: true, message: "Mise à jour des pronostics de la saison :" + result.message };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des pronostics de la saison :", error);
    return { success: false, message: "Erreur lors de la mise à jour des pronostics de la saison :" + error };
  }
};

const updateWeeklyRankings = async (matchday, competitionId, seasonId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        matchday,
        competition_id: competitionId,
        season_id: seasonId,
        points: { [Op.not]: null },
      },
      include: [{ model: User, as: 'UserId' }],
    });

    const rankings = bets.reduce((acc, bet) => {
      const userId = bet.user_id;

      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          points: 0,
          result_points: 0,
          score_points: 0,
          scorer_points: 0,
        };
      }

      acc[userId].points += bet.points;
      acc[userId].result_points += bet.result_points;
      acc[userId].score_points += bet.score_points;
      acc[userId].scorer_points += bet.scorer_points;

      return acc;
    }, {});

    const sortedRankings = Object.values(rankings).sort((a, b) => b.points - a.points);

    let position = 1;
    for (const rank of sortedRankings) {
      await UserRanking.create({
        user_id: rank.user_id,
        competition_id: competitionId,
        season_id: seasonId,
        matchday,
        position,
        points: rank.points,
        result_points: rank.result_points,
        score_points: rank.score_points,
        scorer_points: rank.scorer_points,
      });
      position++;
    }

    console.log(`Classement hebdomadaire pour la journée ${matchday} mis à jour avec succès.`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des classements hebdomadaires:', error);
    throw error;
  }
};

const scheduleWeeklyRankingUpdate = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
    const matchday = await getClosestPastMatchday(seasonId);

    await updateWeeklyRankings(matchday, competitionId, seasonId);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la tâche cron:', error);
  }
};

const getClosestPastMatchday = async (seasonId) => {
  try {
    const match = await Match.findOne({
      where: {
        season_id: seasonId,
        utc_date: {
          [Op.lte]: new Date(),
        },
      },
      order: [['utc_date', 'DESC']],
      attributes: ['matchday'],
    });

    if (!match) {
      console.warn('Aucun match trouvé pour la saison donnée.');
      return null;
    }

    return match.matchday;
  } catch (error) {
    console.error('Erreur lors de la récupération du matchday antérieur le plus proche:', error);
    throw error;
  }
};

module.exports = {
  calculatePoints,
  checkBetByMatchId,
  checkupBets,
  getNullBets,
  getLastMatchdayPoints,
  getWeekPoints,
  getClosestPastMatchday,
  getMonthPoints,
  getSeasonPoints,
  createBet,
  updateBet,
  getSeasonRanking,
  getRanking,
  getLastBetsByUserId,
  getAllLastBets,
  getMatchdayRanking,
  updateAllBetsForCurrentSeason,
  updateWeeklyRankings,
  scheduleWeeklyRankingUpdate
};