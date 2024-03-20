const rewardService = require('../services/rewardService');

async function getAllUserRewards(req, res) {
  const userId = req.params.userId;
  const rewards = await rewardService.getAllRewardsForUser(userId);
  res.json(rewards);
}

module.exports = {
  getAllUserRewards,
}