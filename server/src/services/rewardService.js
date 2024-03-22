const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const {Reward} = require("../models");

const allRewards = async function (req, res) {
  try {
    const rewards = await Reward.findAll()
    res.json(rewards)
  } catch (error) {
    logger.error('Erreur lors de la recuperation des rewards:', error)
  }
}

async function getRewardsByUser(userId) {
  try {

  } catch (error) {

  }
}

module.exports = {
  allRewards,
  getRewardsByUser,
}