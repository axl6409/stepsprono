const express = require('express')
const router = express.Router()
const axios = require("axios");
const {authenticateJWT} = require("../middlewares/auth");
const {Competition} = require("../models");
const {getCompetitionsByCountry} = require("../services/competitionService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

router.get('/competitions', authenticateJWT, async (req, res) => {
  try {
    const competitions = await Competition.findAll();
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée' , error: error.message });
  }
})
router.get('/competitions/by-country/:code', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const competitions = await getCompetitionsByCountry(req.params.matchId)
    res.status(200).json({ competitions: competitions })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des compétitions', message: error.message })
  }
})


module.exports = router