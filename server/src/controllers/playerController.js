const express = require('express')
const router = express.Router()
const {authenticateJWT, checkAdmin, checkManager, checkTreasurer, checkManagerTreasurer} = require("../middlewares/auth")
const {Team, Player, PlayerTeamCompetition} = require("../models")
const axios = require("axios")
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService")
const logger = require("../utils/logger/logger")
const {updatePlayers, updatePlayerInfo, updatePlayerTeam} = require("../services/playerService");
const apiKey = process.env.FB_API_KEY
const apiHost = process.env.FB_API_HOST
const apiBaseUrl = process.env.FB_API_URL

/* PUBLIC - GET */
router.get('/player/:id', authenticateJWT, async (req, res) => {
  try {
    const playerId = req.params.id;
    if (!playerId) {
      return res.status(400).send('Aucun identifiant d\'équipe fourni');
    }
    const player = await PlayerTeamCompetition.findOne({
      where: {
        player_id: playerId
      },
      include: [
        { model: Player, as: 'Player' },
      ]
    });
    res.json(player);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs :', error);
    res.status(500).send(error);
  }
})
router.get('/players', authenticateJWT, async (req, res) => {
  try {
    const teamId1 = req.query.teamId1;
    const teamId2 = req.query.teamId2;
    let queryCondition;
    if (teamId1 && teamId2) {
      queryCondition = {
        team_id: [teamId1, teamId2]
      };
    } else if (teamId1 || teamId2) {
      queryCondition = {
        team_id: teamId1 || teamId2
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

/* ADMIN - POST */
router.post('/admin/players/update', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) {
    return res.status(400).json({ message: 'Aucun identifiant d\'équipe fourni' });
  }
  try {
    await updatePlayers([teamId], 61);
    res.status(200).json({ message: 'Mise à jour des joueurs réussie' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des joueurs :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des joueurs', error: error.message });
  }
});

router.patch('/admin/player/:id', authenticateJWT, checkManagerTreasurer,  async (req, res) => {
  try {
    const player = await updatePlayerInfo(req.params.id, req.body);
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du joueur', error: err.message });
  }
});

router.patch('/admin/player/:id/team', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const { teamId, competitionId } = req.body;
    const result = await updatePlayerTeam(req.params.id, teamId, competitionId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du changement d’équipe', error: err.message });
  }
});

module.exports = router