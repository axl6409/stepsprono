const logger = require("../utils/logger/logger");
const {Bet, Match, User, Setting, UserRanking, UserSeason} = require("../models");
const { getWeekDateRange, getMonthDateRange } = require("./logic/dateLogic");
const {getLastMatchdayPoints} = require("./betService");
const {Op} = require("sequelize");
const {getCurrentMonthMatchdays} = require("./matchdayService");

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

    // Récupérer uniquement les utilisateurs actifs pour la saison actuelle
    const activeUsers = await UserSeason.findAll({
      where: {
        season_id: seasonId,
        is_active: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'img'],
        required: true
      }]
    });

    // Créer un tableau d'IDs d'utilisateurs actifs pour le filtrage
    const activeUserIds = activeUsers.map(userSeason => userSeason.user_id);

    // Si aucun utilisateur actif, retourner un tableau vide
    if (activeUserIds.length === 0) {
      return [];
    }

    // Récupérer les utilisateurs actifs avec leurs détails
    const users = await User.findAll({
      where: { id: activeUserIds },
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
      user_id: activeUserIds, // Ne prendre en compte que les paris des utilisateurs actifs
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

const getSeasonRanking = async (seasonId) => {
  try {
    // Récupérer les utilisateurs actifs pour la saison
    const activeUsers = await UserSeason.findAll({
      where: {
        season_id: seasonId,
        is_active: true
      },
      attributes: ['user_id']
    });

    const activeUserIds = activeUsers.map(user => user.user_id);

    // Si aucun utilisateur actif, retourner un tableau vide
    if (activeUserIds.length === 0) {
      return [];
    }

    // Récupérer le classement uniquement pour les utilisateurs actifs
    const rankings = await UserRanking.findAll({
      where: { 
        season_id: seasonId,
        user_id: activeUserIds
      },
      order: [['position', 'ASC']],
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username']
      }]
    });

    return rankings.map(r => ({
      userId: r.user_id,
      username: r.User.username,
      position: r.position,
      points: r.points,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération du classement saison:", error);
    throw error;
  }
};

const getSeasonRankingEvolution = async (seasonId, userId) => {
  // Récupérer les utilisateurs actifs pour la saison
  const activeUsers = await UserSeason.findAll({
    where: {
      season_id: seasonId,
      is_active: true
    },
    attributes: ['user_id']
  });

  const activeUserIds = activeUsers.map(user => user.user_id);
  
  // Si l'utilisateur demandé n'est pas actif, retourner des tableaux vides
  if (!activeUserIds.includes(userId)) {
    return { userId, userPositions: [], othersPositions: {} };
  }

  // Récupérer l'historique des classements uniquement pour les utilisateurs actifs
  const rankings = await UserRanking.findAll({
    where: { 
      season_id: seasonId,
      user_id: activeUserIds
    },
    order: [['matchday', 'ASC'], ['position', 'ASC']],
  });

  const userPositions = [];
  const othersPositions = {};

  // Filtrer les autres utilisateurs actifs (sauf l'utilisateur courant)
  const otherActiveUserIds = activeUserIds.filter(id => id !== userId);

  // Récupérer les pseudos des autres utilisateurs actifs
  const users = await User.findAll({
    where: { id: otherActiveUserIds },
    attributes: ['id', 'username'],
  });

  // Crée une map user_id -> username
  const pseudoMap = {};
  users.forEach(u => {
    pseudoMap[u.id] = u.username;
  });

  // Traiter les classements
  for (const row of rankings) {
    if (row.user_id === userId) {
      userPositions.push({ matchday: row.matchday, position: row.position });
    } else if (otherActiveUserIds.includes(row.user_id)) {
      if (!othersPositions[row.user_id]) {
        othersPositions[row.user_id] = {
          username: pseudoMap[row.user_id] || `User ${row.user_id}`,
          positions: [],
        };
      }
      othersPositions[row.user_id].positions.push({
        matchday: row.matchday,
        position: row.position,
      });
    }
  }

  return { userId, userPositions, othersPositions };
};

module.exports = {
  getRanking,
  getSeasonRanking,
  getSeasonRankingEvolution,
};