const rewardService = require('../services/rewardService');
const logger = require("../utils/logger/logger");

const getAllRewards = async function (req, res) {
  try {
    const rewards = rewardService.allRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
    logger.error('Erreur lors de la recuperation des trophées:', error)
  }
}

const getAllUserRewards = async function (req, res) {
  const userId = req.params.userId;
  const rewards = await rewardService.getRewardsByUser(userId);
  res.json(rewards);
}

const checkAvailableRewards = async function (req, res) {
  const userId = req.params.userId;
  const rewards = await rewardService.checkAvailableRewards(userId);
  res.json(rewards);
}

module.exports = {
  getAllRewards,
  getAllUserRewards,
}