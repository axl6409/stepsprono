const rewardService = require('../services/rewardService');
const logger = require("../utils/logger/logger");

const allRewards = async function (req, res) {
  try {
    const rewards = rewardService.allRewards();
    res.json(rewards);
    logger.info("Rewards récupérés:", rewards);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
    logger.error('Erreur lors de la recuperation des rewards:', error)
  }

}
const getAllUserRewards = async function (req, res) {
  const userId = req.params.userId;
  const rewards = await rewardService.getRewardsByUser(userId);
  res.json(rewards);
}

module.exports = {
  allRewards,
  getAllUserRewards,
}