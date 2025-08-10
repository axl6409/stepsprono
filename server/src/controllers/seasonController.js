const express = require('express')
const router = express.Router()
const {authenticateJWT, checkAdmin} = require("../middlewares/auth");
const { Season } = require("../models");
const {getCurrentSeasonId, checkAndAddNewSeason, getCurrentSeasonDatas} = require("../services/seasonService");
const logger = require("../utils/logger/logger");

/* PUBLIC - GET */
router.get('/seasons/current/:competition', authenticateJWT, async (req, res) => {
  try {
    const competition = req.params.competition;
    const currentSeason = await getCurrentSeasonId(competition);
    res.status(200).json({ currentSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
  }
})
router.get('/seasons/current/datas/:competition', authenticateJWT, async (req, res) => {
  try {
    const competition = req.params.competition;
    const currentSeason = await getCurrentSeasonDatas(competition);
    res.status(200).json({ currentSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
  }
})
router.get('/seasons/:competition', authenticateJWT, async (req, res) => {
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

/* ADMIN - POST */
router.post('/admin/seasons/check-and-add/:competition', authenticateJWT, checkAdmin, async (req, res) => {
  try {
    const competition = req.params.competition;
    const newSeason = await checkAndAddNewSeason(competition);
    res.status(200).json({ newSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
  }
})


module.exports = router