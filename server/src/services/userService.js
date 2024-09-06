const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const { Op, fn, col, literal, Sequelize} = require('sequelize');
const { User, Bet, Match, UserReward, Season } = require("../models");
const schedule = require('node-schedule');
const bcrypt = require('bcrypt');
const { getPeriodMatchdays } = require("./appService");

/**
 * Retrieves the rank of a user within a specified period based on the total points earned from bets.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} startDate - The start date of the period in the format 'YYYY-MM-DD'.
 * @param {string} endDate - The end date of the period in the format 'YYYY-MM-DD'.
 * @return {Promise<number>} A promise that resolves to the rank of the user within the specified period.
 * @throws {Error} If there is an error retrieving the matchdays or calculating the ranking.
 */
const getUserRank = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);

    if (matchdays.length === 0) {
      throw new Error("Aucun jour de match trouvé pour la période donnée.");
    }

    const pointsAtDate = await Bet.findAll({
      where: {
        matchday: {
          [Op.in]: matchdays
        },
      },
      attributes: ['user_id', [fn('SUM', col('points')), 'points']],
      group: ['user_id'],
      order: [[literal('points'), 'DESC']],
    });

    if (!pointsAtDate.length) {
      throw new Error("Aucun pari trouvé pour la période donnée.");
    }

    const rankedUsers = pointsAtDate.map((entry) => entry.user_id);
    const userRank = rankedUsers.indexOf(userId) + 1;
    return { userRank, pointsAtDate };
  } catch (error) {
    console.error("Erreur lors de la récupération du classement:", error);
    throw error;
  }
};

/**
 * Retrieves the user's rank within a specified period.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - The start date of the period.
 * @param {Date} endDate - The end date of the period.
 * @return {Promise<boolean>} A boolean indicating whether the user was in the top 3 in the period and returned to the top 3.
 * @throws {Error} If there is an error retrieving the classifications or if the user is not found.
 */
const getUserRankByPeriod = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    const betResults = await Bet.findAll({
      where: {
        matchday: {
          [Op.in]: matchdays
        }
      },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'username']
      }]
    });

    // Regrouper les points par utilisateur et par journée sportive
    const pointsPerUser = {};
    betResults.forEach(bet => {
      if (!pointsPerUser[bet.matchday]) {
        pointsPerUser[bet.matchday] = {};
      }
      if (!pointsPerUser[bet.matchday][bet.User.id]) {
        pointsPerUser[bet.matchday][bet.User.id] = 0;
      }
      pointsPerUser[bet.matchday][bet.User.id] += bet.points;
    });

    // Déterminer les classements pour chaque journée sportive
    const rankings = {};
    for (const matchday in pointsPerUser) {
      const sortedUsers = Object.entries(pointsPerUser[matchday])
        .sort(([, aPoints], [, bPoints]) => bPoints - aPoints)
        .map(([userId], index) => ({
          userId: parseInt(userId, 10),
          rank: index + 1
        }));
      rankings[matchday] = sortedUsers;
    }

    // Analyser les classements de l'utilisateur cible
    let inTop3 = false;
    let outOfTop3 = false;
    let backInTop3 = false;

    for (const matchday in rankings) {
      const userRanking = rankings[matchday].find(r => r.userId === userId);
      if (userRanking) {
        if (userRanking.rank <= 3) {
          if (inTop3 && outOfTop3) {
            backInTop3 = true;
            break;
          } else {
            inTop3 = true;
          }
        } else {
          if (inTop3) {
            outOfTop3 = true;
          }
        }
      }
    }

    return inTop3 && outOfTop3 && backInTop3;

  } catch (error) {
    console.error('Erreur lors de la vérification du classement de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Retrieves the total points accumulated by a user for a specific week.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startOfWeek - The start date of the week.
 * @param {Date} endOfWeek - The end date of the week.
 * @return {Promise<number>} The total points accumulated by the user for the week.
 * @throws {Error} If there is an error retrieving the points.
 */
const getUserPointsForWeek = async (userId, startOfWeek, endOfWeek) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
    });
    return bets.reduce((total, bet) => total + bet.points, 0);
  } catch (error) {
    console.error("Erreur lors de la sélection des points:", error);
    throw error;
  }
}

/**
 * Checks if all the predictions made by a user within a given date range are correct.
 *
 * @param {number} userId - The ID of the user whose predictions are being checked.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} A promise that resolves to true if all the predictions are correct,
 *                            and false otherwise.
 * @throws {Error} If there is an error while retrieving the matchdays or the matchs.
 */
const checkUserCorrectPredictions = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    const matchs = await Match.findAll({
      where: {
        matchday: {
          [Op.in]: matchdays
        },
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
      },
      include: [{
        model: Bet,
        as: 'MatchId',
        where: {
          user_id: userId
        }
      }]
    });

    for (const match of matchs) {
      const bet = match.MatchId[0];
      logger.info('[checkUserCorrectPredictions | BET RESULT] => userID:', userId, ' | bet.winner_id:', bet.winner_id, ' | match.winner_id:', match.winner_id);
      if (bet && bet.winner_id !== match.winner_id) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification des prédictions de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Checks if all the predictions made by a user within a given date range are incorrect.
 *
 * @param {number} userId - The ID of the user whose predictions are being checked.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} A promise that resolves to true if all the predictions are incorrect,
 *                            and false otherwise.
 * @throws {Error} If there is an error while retrieving the matchs or the bets.
 */
const checkUserIncorrectPredictions = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    const matchs = await Match.findAll({
      where: {
        matchday: {
          [Op.in]: matchdays
        },
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        },
      },
      include: [{
        model: Bet,
        as: 'MatchId',
        where: {
          user_id: userId
        }
      }]
    });

    for (const match of matchs) {
      const bet = match.MatchId[0];
      logger.info('[checkUserIncorrectPredictions | BET RESULT] => userID:', userId, ' | bet.winner_id:', bet.winner_id, ' | match.winner_id:', match.winner_id);
      if (bet && bet.winner_id === match.winner_id) {
        return false;
      }
    }

    return true; // Toutes les prédictions sont incorrectes
  } catch (error) {
    console.error('Erreur lors de la vérification des prédictions incorrectes de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Checks if a user has made any predictions of 0-0 for a given period of matchdays.
 *
 * @param {number} userId - The ID of the user to check.
 * @param {string} startDate - The start date of the period in 'YYYY-MM-DD' format.
 * @param {string} endDate - The end date of the period in 'YYYY-MM-DD' format.
 * @return {Promise<boolean>} A promise that resolves to true if the user has made any predictions of 0-0, false otherwise.
 * @throws {Error} If there is an error retrieving the matchdays or bets.
 */
const checkUserZeroPredictions = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        home_score: 0,
        away_score: 0,
        matchday: {
          [Op.in]: matchdays
        },
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          score_full_time_home: 0,
          score_full_time_away: 0,
          matchday: {
            [Op.in]: matchdays
          },
          require_details: true
        }
      }]
    });

    return bets.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des prédictions 0-0 de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Checks if all the predictions made by a user within a given date range are exact scores.
 *
 * @param {number} userId - The ID of the user whose predictions are being checked.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} A promise that resolves to true if all the predictions are exact scores,
 *                            and false otherwise.
 * @throws {Error} If there is an error while retrieving the bets or the matches.
 */
const checkExactScorePredictions = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        matchday: {
          [Op.in]: matchdays
        },
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          matchday: {
            [Op.in]: matchdays
          }
        },
        attributes: ['score_full_time_home', 'score_full_time_away']
      }]
    });
    for (const bet of bets) {
      const match = bet.MatchId;
      if (bet.home_score !== match.score_full_time_home || bet.away_score !== match.score_full_time_away) {
        return false;
      }
    }
    return bets.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des prédictions de score exact de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Checks if there are any incorrect score predictions for a user within a given date range.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} startDate - The start date of the date range in the format 'YYYY-MM-DD'.
 * @param {string} endDate - The end date of the date range in the format 'YYYY-MM-DD'.
 * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether there are any incorrect score predictions.
 * @throws {Error} If there is an error retrieving the matchdays or checking the score predictions.
 */
const checkIncorrectScorePredictions = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);

    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        matchday: {
          [Op.in]: matchdays
        }
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          matchday: {
            [Op.in]: matchdays
          }
        },
        attributes: ['score_full_time_home', 'score_full_time_away'],
        required: true
      }]
    });

    for (const bet of bets) {
      const match = bet.MatchId;
      if (!match.require_details) {
        return false;
      }
      if (bet.home_score === match.score_full_time_home && bet.away_score === match.score_full_time_away) {
        return false;
      }
    }

    return bets.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des prédictions incorrectes de score de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Retrieves the ranking status of a user for a given period.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} startDate - The start date of the period in the format 'YYYY-MM-DD'.
 * @param {string} endDate - The end date of the period in the format 'YYYY-MM-DD'.
 * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the user is ranked top for all matchdays within the given period.
 * @throws {Error} If there is an error retrieving the matchdays or calculating the ranking status.
 */
const getUserTopRankingStatus = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let userIsTopRanked = true;

    for (const matchday of matchdays) {
      const betResults = await Bet.findAll({
        where: {
          matchday: matchday
        },
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'username']
        }]
      });

      const pointsPerUser = {};
      betResults.forEach(bet => {
        if (!pointsPerUser[bet.User.id]) {
          pointsPerUser[bet.User.id] = 0;
        }
        pointsPerUser[bet.User.id] += bet.points;
      });

      const sortedUsers = Object.entries(pointsPerUser)
        .sort(([, aPoints], [, bPoints]) => bPoints - aPoints);

      if (sortedUsers.length === 0) {
        userIsTopRanked = false;
        break;
      }

      const topUser = sortedUsers[0];

      if (parseInt(topUser[0], 10) !== userId) {
        userIsTopRanked = false;
        break;
      }
    }

    return userIsTopRanked;
  } catch (error) {
    console.error('Erreur lors de la vérification du classement de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Retrieves the bottom ranking status of a user within a specified period.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - The start date of the period.
 * @param {Date} endDate - The end date of the period.
 * @return {Promise<boolean>} A boolean indicating whether the user is at the bottom of the ranking in each matchday within the period.
 * @throws {Error} If there is an error retrieving the bet results or if the user is not found.
 */
const getUserBottomRankingStatus = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let userIsBottomRanked = true;

    for (const matchday of matchdays) {
      const betResults = await Bet.findAll({
        where: {
          matchday: matchday
        },
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'username']
        }]
      });

      const pointsPerUser = {};
      betResults.forEach(bet => {
        if (!pointsPerUser[bet.User.id]) {
          pointsPerUser[bet.User.id] = 0;
        }
        pointsPerUser[bet.User.id] += bet.points;
      });

      const sortedUsers = Object.entries(pointsPerUser)
        .sort(([, aPoints], [, bPoints]) => aPoints - bPoints);

      if (sortedUsers.length === 0) {
        userIsBottomRanked = false;
        break;
      }

      const bottomUser = sortedUsers[0];

      if (parseInt(bottomUser[0], 10) !== userId) {
        userIsBottomRanked = false;
        break;
      }
    }

    return userIsBottomRanked;
  } catch (error) {
    console.error('Erreur lors de la vérification du classement de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Checks if the user has no predictions for the given week.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startOfWeek - The start of the week.
 * @param {Date} endOfWeek - The end of the week.
 * @return {Promise<boolean>} Returns true if the user has no predictions for the week, false otherwise.
 * @throws {Error} Throws an error if there is an error during the check.
 */
const checkNoPredictionsForWeek = async (userId, startOfWeek, endOfWeek) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
    });

    return bets.length === 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des pronostics de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Checks if a user has made a correct prediction for the full score of a match within a given week.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startOfWeek - The start date of the week in the format 'YYYY-MM-DD'.
 * @param {Date} endOfWeek - The end date of the week in the format 'YYYY-MM-DD'.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating if the user has made a correct prediction.
 * @throws {Error} If there is an error retrieving the bet or checking the criteria.
 */
const checkCorrectMatchFullPrediction = async (userId, startOfWeek, endOfWeek) => {
  try {
    const bet = await Bet.findOne({
      where: {
        user_id: userId,
      },
      include: [{
        model: Match,
        as: 'MatchId',
      }],
      createdAt: {
        [Op.between]: [startOfWeek, endOfWeek],
      },
    });

    if (!bet) {
      return false;
    }

    const match = bet.MatchId;

    if (!bet.MatchId.require_details) {
      return false;
    }
    const correctWinner = bet.winner_id === match.winner_id;
    const correctScore = bet.home_score === match.score_full_time_home && bet.away_score === match.score_full_time_away;
    let scorers = match.scorers;
    if (typeof scorers === 'string') {
      scorers = JSON.parse(scorers);
    }
    let correctScorer = false;
    if (Array.isArray(scorers)) {
      correctScorer = scorers.some(scorer => scorer.player_id === bet.player_goal);
    }
    return correctWinner && correctScore && correctScorer;
  } catch (error) {
    console.error('Erreur lors de la vérification des critères Triple Menace:', error);
    throw error;
  }
};

/**
 * Checks if a user has made an incorrect prediction for the full score of a match within a given week.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startOfWeek - The start date of the week in the format 'YYYY-MM-DD'.
 * @param {Date} endOfWeek - The end date of the week in the format 'YYYY-MM-DD'.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating if the user has made an incorrect prediction.
 * @throws {Error} If there is an error retrieving the bet or checking the criteria.
 */
const checkIncorrectMatchFullPrediction = async (userId, startOfWeek, endOfWeek) => {
  try {
    const bet = await Bet.findOne({
      where: {
        user_id: userId,
      },
      include: [{
        model: Match,
        as: 'MatchId',
      }],
      createdAt: {
        [Op.between]: [startOfWeek, endOfWeek],
      },
    });

    if (!bet) {
      return false;
    }

    const match = bet.MatchId;

    if (!bet.MatchId.require_details) {
      return false;
    }

    const incorrectWinner = bet.winner_id !== match.winner_id;
    const incorrectScore = bet.home_score !== match.score_full_time_home || bet.away_score !== match.score_full_time_away;
    let scorers = match.scorers;
    if (typeof scorers === 'string') {
      scorers = JSON.parse(scorers);
    }
    let incorrectScorer = false;
    if (Array.isArray(scorers)) {
      incorrectScorer = scorers.some(scorer => scorer.player_id !== bet.player_goal)
    }

    return incorrectWinner && incorrectScore && incorrectScorer;
  } catch (error) {
    console.error('Erreur lors de la vérification des critères Triple Looser:', error);
    throw error;
  }
};

/**
 * Checks if all bets made by a user within a given date range are on the home team.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} Returns true if all bets are on the home team, false otherwise.
 * @throws {Error} Throws an error if there is an error during the check.
 */
const checkHomeTeamBets = async (userId, startDate, endDate) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{
        model: Match,
        as: 'MatchId',
        attributes: ['home_team_id'],
      }],
    });

    for (const bet of bets) {
      if (bet.winner_id !== bet.MatchId.home_team_id) {
        return false;
      }
    }

    return bets.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des paris sur les équipes à domicile:', error);
    throw error;
  }
};

/**
 * Checks if all bets made by a user within a given date range are on the away team.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} Returns true if all bets are on the away team, false otherwise.
 * @throws {Error} Throws an error if there is an error during the check.
 */
const checkAwayTeamBets = async (userId, startDate, endDate) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{
        model: Match,
        as: 'MatchId',
        attributes: ['away_team_id'],
      }],
    });

    for (const bet of bets) {
      if (bet.winner_id !== bet.MatchId.away_team_id) {
        return false;
      }
    }

    return bets.length > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification des paris sur les équipes à l\'extérieur:', error);
    throw error;
  }
};

/**
 * Checks if a user has made a visionary bet within a given date range.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} Returns true if the user has made a visionary bet, false otherwise.
 * @throws {Error} Throws an error if there is an error during the check.
 */
const checkVisionaryBet = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let userIsVisionary = false;

    for (const matchday of matchdays) {
      const bets = await Bet.findAll({
        where: {
          matchday: matchday,
        },
        include: [{
          model: Match,
          as: 'MatchId',
          attributes: ['winner_id'],
        }]
      });

      const totalBets = await Bet.count({
        where: {
          matchday: matchday,
        },
      });

      const winningBets = bets.filter(bet => bet.winner_id === bet.MatchId.winner_id);
      const userBet = bets.find(bet => bet.user_id === userId);

      if (userBet) {
        const countSameWinner = winningBets.length;
        const percentage = (countSameWinner / totalBets) * 100;

        if (userBet.winner_id === userBet.MatchId.winner_id && percentage <= 1) {
          userIsVisionary = true;
          break;
        }
      }
    }

    return userIsVisionary;
  } catch (error) {
    console.error('Erreur lors de la vérification du pari visionnaire:', error);
    throw error;
  }
};

/**
 * Checks if a user has made a "blind" bet within a given date range.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @return {Promise<boolean>} Returns true if the user has made a "blind" bet, false otherwise.
 * @throws {Error} Throws an error if there is an error during the check.
 */
const checkBlindBet = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let userIsBlind = false;

    for (const matchday of matchdays) {
      const bets = await Bet.findAll({
        where: {
          matchday: matchday,
        },
        include: [{
          model: Match,
          as: 'MatchId',
          attributes: ['winner_id'],
        }]
      });

      const totalBets = await Bet.count({
        where: {
          matchday: matchday,
        },
      });

      const userBet = bets.find(bet => bet.user_id === userId);

      if (userBet) {
        const winningBets = bets.filter(bet => bet.winner_id === bet.MatchId.winner_id);
        console.log("WinningBets => " + winningBets.length)
        const countOtherResults = totalBets - winningBets.length;
        console.log("totalBets => " + totalBets)
        const percentage = (countOtherResults / totalBets) * 100;
        console.log("Percentage => " + percentage)

        if (userBet.winner_id !== userBet.MatchId.winner_id && percentage >= 99) {
          userIsBlind = true;
          break;
        }
      }
    }

    return userIsBlind;
  } catch (error) {
    console.error('Erreur lors de la vérification du pari "L\'aveugle":', error);
    throw error;
  }
};

/**
 * Retrieves the count of exact score predictions made by a user for a specific season.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} seasonId - The ID of the season.
 * @return {Promise<boolean>} A promise that resolves to true if the user has made at least 5 exact score predictions,
 *                            and false otherwise.
 * @throws {Error} If there is an error while retrieving the bets or the matches.
 */
const getExactScorePredictionsCount = async (userId, seasonId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        season_id: seasonId,
      },
      include: [{
        model: Match,
        as: 'MatchId',
        attributes: ['id', 'score_full_time_home', 'score_full_time_away']
      }],
    });

    const exactScoreBets = bets.filter(bet =>
      bet.home_score === bet.MatchId.score_full_time_home &&
      bet.away_score === bet.MatchId.score_full_time_away
    );

    return exactScoreBets.length >= 5;
  } catch (error) {
    console.error("Erreur lors de la récupération des prédictions exactes:", error);
    throw error;
  }
};

/**
 * Retrieves the top ranking status of a user for two consecutive months.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} firstDayCurrentMonth - The first day of the current month.
 * @param {Date} firstDayPreviousMonth - The first day of the previous month.
 * @return {Promise<boolean>} A promise that resolves to true if the user has the top ranking in both months,
 *                            and false otherwise.
 * @throws {Error} If there is an error while retrieving the top ranking status.
 */
const getUserTopRankingForTwoMonths = async (userId, firstDayCurrentMonth, firstDayPreviousMonth) => {
  try {
    const lastDayCurrentMonth = new Date(firstDayCurrentMonth.getFullYear(), firstDayCurrentMonth.getMonth() + 1, 0);
    const lastDayPreviousMonth = new Date(firstDayPreviousMonth.getFullYear(), firstDayPreviousMonth.getMonth() + 1, 0);
    const topRankingCurrentMonth = await getUserTopRankingStatus(userId, firstDayCurrentMonth, lastDayCurrentMonth);
    const topRankingPreviousMonth = await getUserTopRankingStatus(userId, firstDayPreviousMonth, lastDayPreviousMonth);

    return topRankingCurrentMonth && topRankingPreviousMonth;
  } catch (error) {
    console.error("Erreur lors de la vérification du classement de l'utilisateur pour deux mois consécutifs:", error);
    throw error;
  }
};

/**
 * Retrieves the second place ranking status of a user for two consecutive months.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} firstDayCurrentMonth - The first day of the current month.
 * @param {Date} firstDayPreviousMonth - The first day of the previous month.
 * @return {Promise<boolean>} A promise that resolves to true if the user has the second place ranking in both months,
 *                            and false otherwise.
 * @throws {Error} If there is an error while retrieving the second place ranking status.
 */
const getUserSecondPlaceForTwoMonths = async (userId, firstDayCurrentMonth, firstDayPreviousMonth) => {
  try {
    const lastDayCurrentMonth = new Date(firstDayCurrentMonth.getFullYear(), firstDayCurrentMonth.getMonth() + 1, 0);
    const lastDayPreviousMonth = new Date(firstDayPreviousMonth.getFullYear(), firstDayPreviousMonth.getMonth() + 1, 0);
    const secondPlaceCurrentMonth = await getUserSecondPlaceStatus(userId, firstDayCurrentMonth, lastDayCurrentMonth);
    const secondPlacePreviousMonth = await getUserSecondPlaceStatus(userId, firstDayPreviousMonth, lastDayPreviousMonth);

    return secondPlaceCurrentMonth && secondPlacePreviousMonth;
  } catch (error) {
    console.error("Erreur lors de la vérification du classement de l'utilisateur pour deux mois consécutifs en deuxième place:", error);
    throw error;
  }
};

/**
 * Retrieves the second place status of a user for a given period.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} startDate - The start date of the period in the format 'YYYY-MM-DD'.
 * @param {string} endDate - The end date of the period in the format 'YYYY-MM-DD'.
 * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the user is in the second place for all matchdays within the given period.
 * @throws {Error} If there is an error retrieving the matchdays or calculating the second place status.
 */
const getUserSecondPlaceStatus = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let userIsSecond = true;

    for (const matchday of matchdays) {
      const betResults = await Bet.findAll({
        where: {
          matchday: matchday
        },
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'username']
        }]
      });

      const pointsPerUser = {};
      betResults.forEach(bet => {
        if (!pointsPerUser[bet.User.id]) {
          pointsPerUser[bet.User.id] = 0;
        }
        pointsPerUser[bet.User.id] += bet.points;
      });

      const sortedUsers = Object.entries(pointsPerUser)
        .sort(([, aPoints], [, bPoints]) => bPoints - aPoints);

      const secondUser = sortedUsers[1];

      if (!secondUser || parseInt(secondUser[0], 10) !== userId) {
        userIsSecond = false;
        break;
      }
    }

    return userIsSecond;
  } catch (error) {
    console.error('Erreur lors de la vérification de la deuxième place de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Retrieves the longest correct prediction streak for a user within a specified date range.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} startDate - The start date of the range in the format 'YYYY-MM-DD'.
 * @param {string} endDate - The end date of the range in the format 'YYYY-MM-DD'.
 * @return {Promise<number>} A promise that resolves to the length of the longest correct prediction streak.
 * @throws {Error} If there is an error retrieving the matchdays or calculating the streak.
 */
const getLongestCorrectPredictionStreak = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let longestStreak = 0;
    let currentStreak = 0;
    logger.info('matchdays =>', matchdays);
    for (const matchday of matchdays) {
      const bets = await Bet.findAll({
        where: {
          user_id: userId,
          matchday: matchday,
        },
        include: [{
          model: Match,
          as: 'MatchId',
          attributes: ['id', 'winner_id'],
        }],
      });

      let allCorrect = true;
      for (const bet of bets) {
        if (bet.winner_id !== bet.MatchId.winner_id) {
          allCorrect = false;
          break;
        }
      }

      if (allCorrect) {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  } catch (error) {
    console.error("Erreur lors de la récupération de la série de prédictions correctes:", error);
    throw error;
  }
};

/**
 * Retrieves the longest incorrect prediction streak for a user within a specified date range.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} startDate - The start date of the range in the format 'YYYY-MM-DD'.
 * @param {string} endDate - The end date of the range in the format 'YYYY-MM-DD'.
 * @return {Promise<number>} A promise that resolves to the length of the longest incorrect prediction streak.
 * @throws {Error} If there is an error retrieving the matchdays or calculating the streak.
 */
const getLongestIncorrectPredictionStreak = async (userId, startDate, endDate) => {
  try {
    const matchdays = await getPeriodMatchdays(startDate, endDate);
    let longestStreak = 0;
    let currentStreak = 0;

    for (const matchday of matchdays) {
      const bets = await Bet.findAll({
        where: {
          user_id: userId,
          matchday: matchday,
        },
        include: [{
          model: Match,
          as: 'MatchId',
          attributes: ['id', 'winner_id'],
        }],
      });

      let allIncorrect = true;
      for (const bet of bets) {
        if (bet.winner_id === bet.MatchId.winner_id) {
          allIncorrect = false;
          break;
        }
      }

      if (allIncorrect) {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  } catch (error) {
    console.error("Erreur lors de la récupération de la série de prédictions incorrectes:", error);
    throw error;
  }
};

/**
 * Retrieves the number of correct predictions for a user's favorite team within a specified date range.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} favoriteTeamId - The ID of the favorite team.
 * @return {Promise<number>} A promise that resolves to the number of correct predictions for the user's favorite team.
 * @throws {Error} If there is an error retrieving the bets or calculating the correct predictions.
 */
const getCorrectPredictionsForFavoriteTeam = async (userId, favoriteTeamId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          [Op.or]: [
            { home_team_id: favoriteTeamId },
            { away_team_id: favoriteTeamId }
          ]
        },
        attributes: ['id', 'winner_id'],
      }],
    });

    const correctPredictions = bets.filter(bet => bet.winner_id === bet.MatchId.winner_id);

    return correctPredictions.length;
  } catch (error) {
    console.error("Erreur lors de la récupération des pronostics corrects pour l'équipe favorite:", error);
    throw error;
  }
};

/**
 * Retrieves the number of predictions for a user's favorite team that have the same winner as the favorite team.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} favoriteTeamId - The ID of the favorite team.
 * @return {Promise<number>} A promise that resolves to the number of predictions for the user's favorite team.
 * @throws {Error} If there is an error retrieving the bets.
 */
const getPredictedVictoriesForFavoriteTeam = async (userId, favoriteTeamId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        winner_id: favoriteTeamId,
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          [Op.or]: [
            { home_team_id: favoriteTeamId },
            { away_team_id: favoriteTeamId }
          ]
        },
        attributes: ['id', 'winner_id'],
      }],
    });

    return bets.length;
  } catch (error) {
    console.error("Erreur lors de la récupération des prédictions de victoires pour l'équipe favorite:", error);
    throw error;
  }
};

/**
 * Retrieves the count of correct scorer predictions for a user in a specific season.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} seasonId - The ID of the season.
 * @return {Promise<number>} A promise that resolves to the count of correct scorer predictions.
 * @throws {Error} If there is an error retrieving the bets or filtering the correct scorer bets.
 */
const getCorrectScorerPredictionsCount = async (userId, seasonId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        season_id: seasonId,
      },
      include: [{
        model: Match,
        as: 'MatchId',
        attributes: ['id', 'scorers'],
      }],
    });

    const correctScorerBets = bets.filter(bet => {
      return bet.MatchId.scorers && bet.MatchId.scorers.includes(bet.player_goal);
    });

    return correctScorerBets.length;
  } catch (error) {
    console.error("Erreur lors de la récupération des prédictions correctes du buteur:", error);
    throw error;
  }
};

/**
 * Retrieves the count of unique trophies for a given user.
 *
 * @param {number} userId - The ID of the user.
 * @return {Promise<number>} The count of unique trophies.
 * @throws {Error} If there is an error retrieving the user rewards.
 */
const getUniqueTrophiesCount = async (userId) => {
  try {
    const userRewards = await UserReward.findAll({
      where: {
        user_id: userId,
      },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('reward_id')), 'reward_id']]
    });

    return userRewards.length;
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre de trophées uniques:", error);
    throw error;
  }
};

/**
 * Retrieves the total points accumulated by a user for a specific season.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} seasonId - The ID of the season.
 * @return {Promise<number>} The total points accumulated by the user for the season. If no points are found, 0 is returned.
 * @throws {Error} If there is an error retrieving the total points.
 */
const getTotalPointsForSeason = async (userId, seasonId) => {
  try {
    const totalPoints = await Bet.sum('points', {
      where: {
        user_id: userId,
        season_id: seasonId,
      },
    });

    return totalPoints || 0;
  } catch (error) {
    console.error("Erreur lors de la récupération du total des points pour la saison:", error);
    throw error;
  }
};

/**
 * Retrieves the ID of the user with the highest total points for a given season.
 *
 * @param {number} seasonId - The ID of the season.
 * @return {Promise<number|null>} The ID of the user with the highest total points, or null if no users were found.
 * @throws {Error} If there is an error retrieving the users or calculating the total points.
 */
const getSeasonWinner = async (seasonId) => {
  try {
    const users = await User.findAll();
    let topUserId = null;
    let topPoints = 0;

    for (const user of users) {
      const totalPoints = await getTotalPointsForSeason(user.id, seasonId);

      if (totalPoints > topPoints) {
        topPoints = totalPoints;
        topUserId = user.id;
      }
    }

    return topUserId;
  } catch (error) {
    console.error("Erreur lors de la récupération du gagnant de la saison:", error);
    throw error;
  }
};

/**
 * Checks if a user has won the previous season.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} currentSeasonStartDate - The start date of the current season.
 * @return {Promise<boolean>} Returns true if the user has won the previous season, false otherwise.
 * @throws {Error} If there is an error retrieving the previous season or the season winner.
 */
const hasUserWonPreviousSeason = async (userId, currentSeasonStartDate) => {
  try {
    const previousSeason = await Season.findOne({
      where: {
        end_date: {
          [Op.lt]: currentSeasonStartDate,
        }
      },
      order: [['end_date', 'DESC']],
    });

    if (!previousSeason) {
      return false;
    }

    const previousSeasonWinnerId = await getSeasonWinner(previousSeason.id);
    return previousSeasonWinnerId === userId;
  } catch (error) {
    console.error("Erreur lors de la vérification du gagnant de la saison précédente:", error);
    throw error;
  }
};

/**
 * Retrieves the total points accumulated by a user for a specific season.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} seasonId - The ID of the season.
 * @return {Promise<number>} The total points accumulated by the user for the season. If no points are found, 0 is returned.
 * @throws {Error} If there is an error retrieving the total points.
 */
const getUserPointsForSeason = async (userId, seasonId) => {
  try {
    const totalPoints = await Bet.sum('points', {
      where: {
        user_id: userId,
        season_id: seasonId,
      }
    });
    return totalPoints || 0;
  } catch (error) {
    console.error("Erreur lors de la récupération des points pour l'utilisateur:", error);
    throw error;
  }
};

module.exports = {
  getUserRank,
  getUserPointsForWeek,
  getUserRankByPeriod,
  checkUserCorrectPredictions,
  checkUserIncorrectPredictions,
  checkUserZeroPredictions,
  checkExactScorePredictions,
  checkIncorrectScorePredictions,
  getUserTopRankingStatus,
  getUserBottomRankingStatus,
  checkNoPredictionsForWeek,
  checkCorrectMatchFullPrediction,
  checkIncorrectMatchFullPrediction,
  checkHomeTeamBets,
  checkAwayTeamBets,
  checkVisionaryBet,
  checkBlindBet,
  getExactScorePredictionsCount,
  getUserTopRankingForTwoMonths,
  getUserSecondPlaceForTwoMonths,
  getLongestCorrectPredictionStreak,
  getLongestIncorrectPredictionStreak,
  getCorrectPredictionsForFavoriteTeam,
  getPredictedVictoriesForFavoriteTeam,
  getCorrectScorerPredictionsCount,
  getUniqueTrophiesCount,
  getTotalPointsForSeason,
  getSeasonWinner,
  hasUserWonPreviousSeason,
  getUserPointsForSeason
}