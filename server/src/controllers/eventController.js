const axios = require("axios");
const moment = require("moment-timezone");
const express = require('express')
const {authenticateJWT, checkAdmin} = require("../middlewares/auth");
const {checkMassacreTrophy} = require("../services/rewardService");
const {autoContribution} = require("../services/contributionService");
const {updateMatchAndPredictions} = require("../services/matchService");
const router = express.Router()
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/* ADMIN - POST */
router.post('/admin/events/test', authenticateJWT, checkAdmin, async (req, res) => {
  try {
      const test = await updateMatchAndPredictions(1213851);
    res.send({test});
  } catch (e) {
    res.status(500).json({ message: 'Route protégée', error: e.message })
  }
});

module.exports = router