const axios = require("axios");
const moment = require("moment-timezone");
const express = require('express')
const {authenticateJWT, checkAdmin} = require("../middlewares/auth");
const {checkMassacreTrophy} = require("../services/rewardService");
const router = express.Router()
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/* ADMIN - POST */
router.post('/admin/events/:eventName', authenticateJWT, checkAdmin, async (req, res) => {
  try {
    const eventName = req.params.eventName;
    if (eventName === 'testEvent') {
      const Challenger = await checkMassacreTrophy();
      res.send({Challenger});
    }
  } catch (e) {
    res.status(500).json({ message: 'Route protégée', error: e.message })
  }
});

module.exports = router