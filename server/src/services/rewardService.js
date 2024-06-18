// server/src/services/rewardService.js
const logger = require("../utils/logger/logger");
const { Bet, Match, User, Reward, UserReward } = require("../models");
const { Op } = require("sequelize");
const { getCurrentMatchday } = require("../services/appService");

/**
 * Retrieves all rewards from the database.
 *
 * @return {Array} Array of rewards
 */
const allRewards = async function () {
  try {
    const rewards = await Reward.findAll();
    return rewards;
  } catch (error) {
    logger.error('allRewards: ', error);
    throw error;
  }
}

/**
 * Retrieves rewards for a specific user from the database.
 *
 * @param {type} userId - The ID of the user to retrieve rewards for
 * @return {Array} An array of rewards for the user
 */
const getRewardsByUser = async function (userId) {
  try {
    const rewards = await UserReward.findAll({
      where: { userId },
      include: [Reward]
    });
    return rewards;
  } catch (error) {
    logger.error('getRewardsByUser: ', error);
    throw error;
  }
}

/**
 * A function to check daily rewards.
 */
const checkDailyRewards = function () {
  try {
    // Implémentation de la logique pour vérifier les récompenses journalières
  } catch (error) {
    logger.error('checkDailyRewards ERROR: ', error);
  }
}

/**
 * Checks the weekly champion, assigns rewards if applicable.
 */
const checkWeeklyChampion = async function () {
  try {
    const matchday = await getCurrentMatchday();
    const weeklyChampion = await bestPointsMatchday(matchday);
    if (weeklyChampion) {
      const reward = await Reward.findOne({ where: { slug: 'best_points_matchday' } });
      if (reward) {
        await UserReward.create({ userId: weeklyChampion.id, rewardId: reward.id });
      }
    }
  } catch (error) {
    logger.error('checkWeeklyChampion ERROR: ', error);
  }
}

/**
 * A function to check monthly rewards.
 *
 * @return {type} description of return value
 */
const checkMonthlyRewards = function () {
  try {
    // Implémentation de la logique pour vérifier les récompenses mensuelles
  } catch (error) {
    logger.error('checkMonthlyRewards ERROR: ', error);
  }
}

/**
 * A function to check season rewards.
 *
 * @return {type} description of return value
 */
const checkSeasonRewards = function () {
  try {
    // Implémentation de la logique pour vérifier les récompenses de saison
  } catch (error) {
    logger.error('checkSeasonRewards ERROR: ', error);
  }
}

/**
 * A function to check match rewards.
 *
 * @param {type} match - The match object to check rewards for
 * @param {type} bet - The bet object to check rewards for
 * @return {type} description of return value
 */
const checkMatchRewards = async function (match, bet) {
  try {
    const matchId = match.matchId;
    const betPoints = bet.points;
    // Implémentation de la logique pour vérifier les récompenses de match
  } catch (error) {
    logger.error('checkMatchRewards ERROR: ', error);
    throw error;
  }
}

/**
 * Retrieves the top scorer for a specific matchday.
 *
 * @param {type} matchday - The matchday to retrieve the top scorer for
 * @return {type} The top scorer for the matchday, or null if none found
 */
const bestPointsMatchday = async (matchday) => {
  try {
    const topScorer = await Bet.findAll({
      include: [
        {
          model: Match,
          where: { matchday: matchday },
        },
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      attributes: [
        'userId',
        [Op.in('SUM', Op.col('points')), 'totalPoints'],
      ],
      group: ['userId'],
      order: [[Op.in('SUM', Op.col('points')), 'DESC']],
      limit: 1,
    });
    return topScorer.length ? topScorer[0] : null;
  } catch (error) {
    logger.error('bestPointsMatchday ERROR: ', error);
    throw error;
  }
}

module.exports = {
  allRewards,
  getRewardsByUser,
  checkDailyRewards,
  checkWeeklyChampion,
  checkMonthlyRewards,
  checkSeasonRewards,
  checkMatchRewards,
};
