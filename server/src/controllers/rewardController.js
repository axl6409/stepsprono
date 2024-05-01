const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const rewardService = require('../services/rewardService');
const logger = require("../utils/logger/logger");
const {Reward} = require("../models");

router.get('/rewards', authenticateJWT, async (req, res) => {
  try {
    const rewards = await Reward.findAll();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
  }
})

module.exports = router