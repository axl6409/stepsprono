const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const { Op, fn, col, literal } = require('sequelize');
const { User, Bet, Match } = require("../models");
const schedule = require('node-schedule');
const bcrypt = require('bcrypt');
const { getPeriodMatchdays } = require("./appService");

/**
 * Retrieves the rank of a user based on their points accumulated up to a specific date.
 *
 * @param {number} userId - The ID of the user.
 * @param {Date} date - The date up to which the points are considered.
 * @return {Promise<number>} The rank of the user, starting from 1.
 * @throws {Error} If there is an error retrieving the rank.
 */
const getUserRank = async (userId, date) => {
    try {
        const pointsAtDate = await Bet.findAll({
            where: {
                createdAt: {
                    [Op.lte]: date,
                },
            },
            attributes: ['user_id', [fn('SUM', col('points')), 'points']],
            group: ['user_id'],
            order: [[literal('points'), 'DESC']],
        });

        const rankedUsers = pointsAtDate.map((entry) => entry.user_id);
        const userRank = rankedUsers.indexOf(userId) + 1;
        return userRank;
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
        }
      },
      include: [{
        model: Bet,
        as: 'MatchId',
        where: {
          user_id: userId
        }
      }]
    });

    // Vérifier si toutes les prédictions sont correctes
    for (const match of matchs) {
      const bet = match.MatchId[0]; // Chaque utilisateur devrait avoir un seul pari par match
      if (bet && bet.winner_id !== match.winner_id) {
        return false; // Si une seule prédiction est incorrecte, retourner false
      }
    }

    return true; // Toutes les prédictions sont correctes
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
        }
      },
      include: [{
        model: Bet,
        as: 'MatchId',
        where: {
          user_id: userId
        }
      }]
    });

    // Vérifier si toutes les prédictions sont incorrectes
    for (const match of matchs) {
      const bet = match.MatchId[0]; // Chaque utilisateur devrait avoir un seul pari par match
      if (bet && bet.winner_id === match.winner_id) {
        return false; // Si une seule prédiction est correcte, retourner false
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
        }
      },
      include: [{
        model: Match,
        as: 'MatchId',
        where: {
          score_full_time_home: 0,
          score_full_time_away: 0,
          matchday: {
            [Op.in]: matchdays
          }
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
        attributes: ['score_full_time_home', 'score_full_time_away']
      }]
    });

    for (const bet of bets) {
      const match = bet.MatchId;
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

    const correctWinner = bet.winner_id === match.winner_id;
    const correctScore = bet.home_score === match.score_full_time_home && bet.away_score === match.score_full_time_away;
    const correctScorer = match.scorers && match.scorers.some(scorer => scorer.player_id === bet.player_goal);

    return correctWinner && correctScore && correctScorer;
  } catch (error) {
    console.error('Erreur lors de la vérification des critères Triple Menace:', error);
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
  checkCorrectMatchFullPrediction
}