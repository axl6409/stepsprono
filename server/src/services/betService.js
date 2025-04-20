const {Op} = require("sequelize");
const {Bet, Match, Team, Player, User, Setting, UserRanking} = require("../models");
const {getCurrentWeekMatchdays, getCurrentMonthMatchdays, getWeekDateRange, getMonthDateRange} = require("./appService");
const logger = require("../utils/logger/logger");
const {getCurrentSeasonId} = require("./seasonService");
const eventBus = require("../events/eventBus");
const sequelize = require("../../database");
const {getCurrentCompetitionId} = require("./competitionService");
const moment = require("moment-timezone");
const {getCurrentMatchday} = require("./matchService");
const {checkBetByMatchId} = require("./logic/betLogic");

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
    let matchdays = await getCurrentMonthMatchdays(seasonId);

    let excludedMatchdays = new Set();

    if (matchdays.length > 0) {
      for (const matchday of matchdays) {
        const matchdayMatches = await Match.findAll({
          where: {
            matchday,
            season_id: seasonId
          },
          order: [['utc_date', 'ASC']]
        });

        if (matchdayMatches.length > 0) {
          const firstMatchDate = new Date(matchdayMatches[0].utc_date);

          const { start } = getMonthDateRange();
          const currentYear = new Date(start).getFullYear();
          const currentMonth = new Date(start).getMonth();
          const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

          if (firstMatchDate.getFullYear() === previousYear && firstMatchDate.getMonth() === previousMonth) {
            excludedMatchdays.add(matchday);
          }
        }
      }

      matchdays = matchdays.filter(md => !excludedMatchdays.has(md));
    }

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
    console.log('❌ Erreur lors de la récupération des points:', error);
    return 0;
  }
};


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
    let excludedMatchdays = new Set();

    if (period === 'month') {
      const { start, end } = getMonthDateRange();
      matchdays = await getCurrentMonthMatchdays();

      if (matchdays.length > 0) {
        for (const matchday of matchdays) {
          const matchdayMatches = await Match.findAll({
            where: {
              matchday,
              season_id: seasonId
            },
            order: [['utc_date', 'ASC']]
          });

          if (matchdayMatches.length > 0) {
            const firstMatchDate = new Date(matchdayMatches[0].utc_date);

            const currentYear = new Date(start).getFullYear();
            const currentMonth = new Date(start).getMonth(); // 0-indexé (janvier = 0)
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            if (firstMatchDate.getFullYear() === previousYear && firstMatchDate.getMonth() === previousMonth) {
              logger.info(`🚨 Exclusion de la journée ${matchday} car elle commence sur le mois précédent.`);
              excludedMatchdays.add(matchday);
            }
          }
        }

        matchdays = matchdays.filter(md => !excludedMatchdays.has(md));
      }
    } else if (period === 'week') {
      const { start, end } = getWeekDateRange();
      console.log("Start", start)
      console.log("End", end)
      dateRange = { created_at: { [Op.between]: [start, end] } };
    }

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
            matchday: { [Op.in]: matchdays }
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
    logger.info({ userId, matchday, matchId, winnerId, homeScore, awayScore, scorer });
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
    logger.info(`[createBet] => Prono créé avec succès (MatchID: ${matchId} | Utilisateur: ${userId} | WinnerID: ${winnerId} | HomeScore: ${homeScore} | AwayScore: ${awayScore} | Scorer: ${scorer})`);
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
  logger.info({ id, userId, matchId, winnerId, homeScore, awayScore, scorer });
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
    logger.info(`[updateBet] => Prono mis à jour avec succès (MatchID: ${matchId}, Utilisateur: ${userId})`);
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
    const matchday = await getCurrentMatchday();

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