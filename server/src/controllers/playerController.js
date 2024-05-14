const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth")
const {Team, Player, PlayerTeamCompetition} = require("../models")
const axios = require("axios")
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService")
const logger = require("../utils/logger/logger")
const apiKey = process.env.FB_API_KEY
const apiHost = process.env.FB_API_HOST
const apiBaseUrl = process.env.FB_API_URL

router.get('/players', authenticateJWT, async (req, res) => {
  try {
    const teamId1 = req.query.teamId1;
    const teamId2 = req.query.teamId2;
    let queryCondition;
    if (teamId1 && teamId2) {
      queryCondition = {
        teamId: [teamId1, teamId2]
      };
    } else if (teamId1 || teamId2) {
      queryCondition = {
        teamId: teamId1 || teamId2
      };
    } else {
      return res.status(400).send('Aucun identifiant d\'équipe fourni');
    }
    const players = await PlayerTeamCompetition.findAll({
      where: queryCondition,
      include: [
        { model: Player, as: 'Player' },
        { model: Team, as: 'Team' },
      ]
    });
    res.json(players);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs :', error);
    res.status(500).send('Erreur interne du serveur');
  }
})

module.exports = router