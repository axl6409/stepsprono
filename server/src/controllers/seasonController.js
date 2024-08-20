const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const axios = require("axios");
const { Season } = require("../models");
const {getCurrentSeasonId, checkAndAddNewSeason} = require("../services/seasonService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

router.get('/seasons/current/:competition', async (req, res) => {
  try {
    const competition = req.params.competition;
    const currentSeason = await getCurrentSeasonId(competition);
    res.status(200).json({ currentSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
  }
})
router.get('/seasons/:competition', async (req, res) => {
  try {
    const competition = req.params.competition;
    const seasons = await Season.findAll({
      where: {
        competition_id: competition
      },
      order: [['year', 'DESC']]
    });
    res.status(200).json(seasons);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des saisons', error: error.message });
  }
});
router.post('/admin/seasons/check-and-add/:competition', async (req, res) => {
  try {
    const competition = req.params.competition;
    const newSeason = await checkAndAddNewSeason(competition);
    res.status(200).json({ newSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
  }
})


module.exports = router