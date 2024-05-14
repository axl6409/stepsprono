const logger = require("../utils/logger/logger");
const {Bet, Match, User, Reward, UserReward} = require("../models");
const {Op} = require("sequelize");
const {getCurrentMatchday} = require("../services/appService");

const allRewards = async function (req, res) {
  try {
    const rewards = await Reward.findAll()
    res.json(rewards)
  } catch (error) {
    logger.error('allRewards: ', error)
  }
}

const getRewardsByUser = async function (userId) {
  try {

  } catch (error) {

  }
}

const checkDailyRewards = function (matchs, user) {
  try {

  } catch (error) {
    logger.error('checkDailyRewards ERROR: ', error)
  }
}

const checkWeeklyChampion = async function () {
  try {
    const matchday = await getCurrentMatchday();
    const weeklyChampion = bestPointsMatchday(matchday)
    if (weeklyChampion) {
      const reward = await Reward.findOne({ where: { slug: 'best_points_matchday' } });
      if (reward) {
        await UserReward.create({ userId: weeklyChampion.id, rewardId: reward.id });
      }
    }
  } catch (error) {
    logger.error('checkWeeklyChampion ERROR: ', error)
  }
}

const checkMonthlyRewards = function () {

}

const checkSeasonRewards = function () {

}

const checkMatchRewards = function (req, res) {
  try {
    const match = req.body.match.matchId
    const betPoints = req.body.bet.points
  } catch (error) {
    logger.error('checkMatchRewards ERROR: ', error)
  }
}

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
    return topScorer.length ? topScorer[0] : null
  } catch (error) {
    logger.error('findTopBetScorerForMatchDay ERROR: ', error)
    throw error
  }
}

const getAllRewards = async function (req, res) {
  try {
    const rewards = allRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
    logger.error('Erreur lors de la recuperation des trophées:', error)
  }
}

const getAllUserRewards = async function (req, res) {
  const userId = req.params.userId;
  const rewards = await getRewardsByUser(userId);
  res.json(rewards);
}

const checkAvailableRewards = async function (req, res) {
  const userId = req.params.userId;
  const rewards = await checkAvailableRewards(userId);
  res.json(rewards);
}

module.exports = {
  allRewards,
  getRewardsByUser,
  checkDailyRewards,
  checkWeeklyChampion,
  checkMonthlyRewards,
  checkSeasonRewards,
}