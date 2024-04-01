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

const getRewardsByUser = async function (userId) {
  try {

  } catch (error) {

  }
}

const checkRewards = function (matchs, user) {

}

const checkMonthlyRewards = function () {

}

const checkSeasonRewards = function () {

}

function pointsSum(points) {
  return points.reduce((a, b) => a + b, 0);
}

module.exports = {
  allRewards,
  getRewardsByUser,
  checkRewards,
  checkMonthlyRewards,
  checkSeasonRewards,
}