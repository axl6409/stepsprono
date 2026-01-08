const logger = require("../utils/logger/logger");
const {Bet, Match, User, Setting, Season, UserRanking, UserSeason, SpecialRuleResult, SpecialRule, Sequelize} = require("../models");
const { getWeekDateRange, getMonthDateRange, getCurrentMoment} = require("./logic/dateLogic");
const {getLastMatchdayPoints} = require("./betService");
const {Op} = require("sequelize");
const {getCurrentMonthMatchdays, getCurrentMatchday} = require("./matchdayService");
const {getPeriodMatchdays} = require("./logic/matchLogic");
const moment = require("moment");
const {getAllMysteryBoxSelections} = require("./mysteryBoxService");

const getRawRanking = async (seasonId, period, matchday = null, month = null) => {
  try {
    const setting = await Setting.findOne({
      where: { key: "rankingMode" },
      attributes: ["active_option"],
    });
    const rankingMode = setting?.active_option;

    let matchdays = [];
    let dateRange = {};
    let excludedMatchdays = new Set();

    if (period === "month") {
      const { start } = getMonthDateRange(month);
      matchdays = await getCurrentMonthMatchdays(null, month);

      if (matchdays.length > 0) {
        for (const matchday of matchdays) {
          const matchdayMatches = await Match.findAll({
            where: { matchday, season_id: seasonId },
            order: [["utc_date", "ASC"]],
          });

          if (matchdayMatches.length > 0) {
            const firstMatchDate = new Date(matchdayMatches[0].utc_date);

            const currentYear = new Date(start).getFullYear();
            const currentMonth = new Date(start).getMonth(); // 0-indexé
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            if (
              firstMatchDate.getFullYear() === previousYear &&
              firstMatchDate.getMonth() === previousMonth
            ) {
              logger.info(
                `🚨 Exclusion de la journée ${matchday} car elle commence sur le mois précédent.`
              );
              excludedMatchdays.add(matchday);
            }
          }
        }

        matchdays = matchdays.filter((md) => !excludedMatchdays.has(md));
      }
    } else if (period === "week") {
      if (matchday) {
        matchdays = [matchday];
      } else {
        const { start, end } = getWeekDateRange();
        dateRange = { created_at: { [Op.between]: [start, end] } };
      }
    }

    // Récupérer uniquement les utilisateurs actifs pour la saison
    const activeUsers = await UserSeason.findAll({
      where: { season_id: seasonId, is_active: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "img"],
          required: true,
        },
      ],
    });

    const activeUserIds = activeUsers.map((userSeason) => userSeason.user_id);
    if (activeUserIds.length === 0) return [];

    // Récupérer les utilisateurs
    const users = await User.findAll({
      where: { id: activeUserIds },
      attributes: ["id", "username", "img"],
    });

    const ranking = users.reduce((acc, user) => {
      acc[user.id] = {
        user_id: user.id,
        username: user.username,
        points: 0,
        tie_breaker_points: 0,
        mode: rankingMode,
        img: user.img,
      };
      return acc;
    }, {});

    const whereCondition = {
      season_id: seasonId,
      user_id: activeUserIds,
      points: { [Op.not]: null },
      ...(period === "month"
        ? { matchday: { [Op.in]: matchdays } }
        : matchday
          ? { matchday }
          : dateRange),
    };

    const bets = await Bet.findAll({
      where: whereCondition,
      include: [{ model: User, as: "UserId", attributes: ["id", "username", "img"] }],
    });

    for (const bet of bets) {
      const userId = bet.user_id;
      if (ranking[userId]) {
        ranking[userId].points += bet.points;

        if (rankingMode === "legit") {
          ranking[userId].tie_breaker_points += bet.result_points;
        } else if (rankingMode === "history") {
          ranking[userId].tie_breaker_points = await getLastMatchdayPoints(userId);
        }
      }
    }

    return Object.values(ranking).sort((a, b) => {
      if (b.points === a.points) {
        return b.tie_breaker_points - a.tie_breaker_points;
      }
      return b.points - a.points;
    });
  } catch (error) {
    console.error(`❌ Erreur dans getRawRanking pour ${period}:`, error);
    throw new Error("Erreur lors de la récupération du classement brut.");
  }
};

/**
 * Retrieves the ranking of users for a given season and period.
 *
 * @param {number} seasonId - The ID of the season.
 * @param {string} period - The period for which to retrieve the ranking ('month', 'week', or 'season').
 * @param {number|null} matchday - The matchday number (for 'week' period).
 * @param {string|null} month - The month in YYYY-MM format (for 'month' period).
 * @return {Promise<Array<Object>>} A promise that resolves to an array of user ranking objects, sorted by points.
 * Each object contains user_id, username, points, tie_breaker_points, mode, and img.
 * @throws {Error} If there is an error while retrieving the ranking.
 */
/**
 * Classement enrichi (applique les règles spéciales si ranking_effect = true)
 */
const getRanking = async (seasonId, period, matchday = null, month = null) => {
  try {
    let sortedRanking = await getRawRanking(seasonId, period, matchday, month);

    let appliedRules = [];

    // Vérifier les règles spéciales
    const ruleResults = await SpecialRuleResult.findAll({
      where: {
        season_id: seasonId,
        config: Sequelize.where(
          Sequelize.cast(Sequelize.json("config.ranking_effect"), "BOOLEAN"),
          true
        ),
      },
    });

    if (ruleResults && ruleResults.length > 0) {
      const matchdays = period === "month" ? await getCurrentMonthMatchdays(null, month) : [];

      for (const rr of ruleResults) {
        const cfg = rr.config || {};
        let applyRule = false;

        if (period === "week") {
          const currentMatchday = await getCurrentMatchday();
          if (cfg.matchday && Number(cfg.matchday) === Number(currentMatchday)) {
            applyRule = true;
          }
        } else if (period === "month") {
          if (cfg.matchday && matchdays.includes(Number(cfg.matchday))) {
            applyRule = true;
          }
        } else if (period === "season") {
          applyRule = true;
        }

        if (applyRule) {
          const specialResults = rr.results || [];

          appliedRules.push({
            rule_id: rr.rule_id,
            season_id: rr.season_id,
            matchday: cfg.matchday,
            type: "hunt_day",
            results: specialResults
          });

          for (const sr of specialResults) {
            const target = sortedRanking.find((u) => u.user_id === sr.user_id);
            if (target) {
              target.points += sr.hunt_result || 0;
            }
          }
        }
      }
    }

    // Appliquer les pénalités balle_perdue de Mystery Box
    try {
      const mysteryBoxSelections = await getAllMysteryBoxSelections();
      const ballePerduPenalties = [];

      for (const selection of mysteryBoxSelections) {
        if (
          selection.item?.key === 'balle_perdue' &&
          selection.usage?.used &&
          selection.usage?.data?.target_user_id
        ) {
          const targetUserId = selection.usage.data.target_user_id;
          const target = sortedRanking.find((u) => u.user_id === targetUserId);
          if (target) {
            target.points -= 1;
            ballePerduPenalties.push({
              shooter_id: selection.user?.id,
              shooter_username: selection.user?.username,
              target_id: targetUserId,
              target_username: target.username,
              penalty: -1
            });
          }
        }
      }

      if (ballePerduPenalties.length > 0) {
        appliedRules.push({
          type: "balle_perdue",
          penalties: ballePerduPenalties
        });
      }
    } catch (mbError) {
      logger.warn('[getRanking] Could not apply balle_perdue penalties:', mbError.message);
    }

    // Resort après application des règles
    const finalRanking = sortedRanking.sort((a, b) => {
      if (b.points === a.points) {
        return b.tie_breaker_points - a.tie_breaker_points;
      }
      return b.points - a.points;
    });

    return {
      ranking: finalRanking,
      rules: appliedRules
    };
  } catch (error) {
    console.error(`❌ Erreur dans getRanking pour ${period}:`, error);
    throw new Error("Erreur lors de la récupération du classement.");
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

const getSeasonRankingEvolution = async (seasonId, userId, period = "season", month = null) => {
  // Récupérer les utilisateurs actifs pour la saison
  const activeUsers = await UserSeason.findAll({
    where: {
      season_id: seasonId,
      is_active: true
    },
    attributes: ['user_id']
  });

  let rangeMatchdays = [];
  if (period === "season") {
    const season = await Season.findByPk(seasonId, { attributes: ["start_date"] });
    if (!season || !season.start_date) {
      throw new Error("Start_date manquante pour la saison");
    }
    const startDate = new Date(season.start_date);
    const endDate = new Date();
    rangeMatchdays = await getPeriodMatchdays(startDate, endDate);
  } else if (period === "month" && month) {
    const startDate = getCurrentMoment(month, "YYYY-MM").startOf("month").toDate();
    const endDate = getCurrentMoment(month, "YYYY-MM").endOf("month").toDate();
    rangeMatchdays = await getPeriodMatchdays(startDate, endDate);
  }

  const activeUserIds = activeUsers.map(user => user.user_id);
  
  // Si l'utilisateur demandé n'est pas actif, retourner des tableaux vides
  if (!activeUserIds.includes(userId)) {
    return { userId, userPositions: [], othersPositions: {} };
  }

  // Récupérer l'historique des classements uniquement pour les utilisateurs actifs
  const rankings = await UserRanking.findAll({
    where: { 
      season_id: seasonId,
      user_id: activeUserIds,
      matchday: { [Op.in]: rangeMatchdays }
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

/**
 * Retrieves the duo ranking for alliance_day special rule.
 * Combines points of paired users and returns a sorted duo ranking.
 *
 * @param {number} seasonId - The ID of the season.
 * @return {Promise<Object>} A promise that resolves to an object containing duo ranking and metadata.
 * Object format: { ranking: Array<Object>, isDuoRanking: boolean, rules: Array }
 * @throws {Error} If there is an error while retrieving the duo ranking.
 */
const getDuoRanking = async (seasonId) => {
  try {
    // Get current matchday
    const currentMatchday = await getCurrentMatchday();

    // Get alliance_day rule
    const allianceRule = await SpecialRule.findOne({
      where: { rule_key: 'alliance_day' }
    });

    // If rule doesn't exist or is not active, return empty result
    if (!allianceRule || !allianceRule.status) {
      return {
        ranking: [],
        isDuoRanking: false,
        rules: [],
        message: "La règle alliance_day n'est pas active"
      };
    }

    const ruleConfig = allianceRule.config || {};

    // Check if rule applies to current matchday
    if (!ruleConfig.matchday || Number(ruleConfig.matchday) !== Number(currentMatchday)) {
      return {
        ranking: [],
        isDuoRanking: false,
        rules: [],
        message: "La règle alliance_day ne s'applique pas à cette semaine"
      };
    }

    // Check if duos are configured
    if (!ruleConfig.selected_users || !Array.isArray(ruleConfig.selected_users) || ruleConfig.selected_users.length === 0) {
      return {
        ranking: [],
        isDuoRanking: false,
        rules: [],
        message: "Aucun duo n'a été configuré"
      };
    }

    // Get raw ranking for the week with current matchday
    const rawRanking = await getRawRanking(seasonId, 'week', currentMatchday);

    if (!rawRanking || rawRanking.length === 0) {
      return {
        ranking: [],
        isDuoRanking: true,
        rules: [],
        message: "Aucun classement disponible pour cette semaine"
      };
    }

    // Create a map of user_id -> user data for quick lookup
    const userMap = {};
    rawRanking.forEach(user => {
      userMap[user.user_id] = user;
    });

    // Build duo ranking
    const duoRanking = [];

    ruleConfig.selected_users.forEach((duo, index) => {
      if (!Array.isArray(duo) || duo.length !== 2) {
        logger.warn(`[getDuoRanking] Invalid duo format at index ${index}`);
        return;
      }

      const user1 = userMap[duo[0].id];
      const user2 = userMap[duo[1].id];

      // Calculate combined points (default to 0 if user not found in ranking)
      const user1Points = user1 ? user1.points : 0;
      const user2Points = user2 ? user2.points : 0;
      const combinedPoints = user1Points + user2Points;

      // Calculate combined tie_breaker
      const user1TieBreaker = user1 ? user1.tie_breaker_points : 0;
      const user2TieBreaker = user2 ? user2.tie_breaker_points : 0;
      const combinedTieBreaker = user1TieBreaker + user2TieBreaker;

      duoRanking.push({
        duo_id: `${duo[0].id}-${duo[1].id}`,
        users: [
          {
            user_id: duo[0].id,
            username: duo[0].username,
            img: duo[0].img || null,
            points: user1Points
          },
          {
            user_id: duo[1].id,
            username: duo[1].username,
            img: duo[1].img || null,
            points: user2Points
          }
        ],
        points: combinedPoints,
        tie_breaker_points: combinedTieBreaker,
        mode: rawRanking[0]?.mode || 'legit'
      });
    });

    // Sort by points (descending), then by tie_breaker (descending)
    duoRanking.sort((a, b) => {
      if (b.points === a.points) {
        return b.tie_breaker_points - a.tie_breaker_points;
      }
      return b.points - a.points;
    });

    return {
      ranking: duoRanking,
      isDuoRanking: true,
      rules: [{
        rule_id: allianceRule.id,
        season_id: seasonId,
        matchday: ruleConfig.matchday,
        type: 'alliance_day'
      }]
    };
  } catch (error) {
    console.error(`❌ Erreur dans getDuoRanking:`, error);
    throw new Error("Erreur lors de la récupération du classement duo.");
  }
};

module.exports = {
  getRawRanking,
  getRanking,
  getSeasonRanking,
  getSeasonRankingEvolution,
  getDuoRanking,
};