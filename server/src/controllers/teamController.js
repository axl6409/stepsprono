const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const axios = require("axios");
const logger = require("../utils/logger/logger");
const { Team, TeamCompetition } = require("../models");
const {getPlayersByTeamId, updatePlayers} = require("../services/playerService");
const {updateTeamStats, createOrUpdateTeams} = require("../services/teamService");
const {getCurrentSeasonYear} = require("../services/seasonService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

router.get('/teams', async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'position';
    const order = req.query.order || 'ASC';

    const teams = await TeamCompetition.findAndCountAll({
      include: [{
        model: Team,
        as: 'Team',
        required: true
      }],
      order: [
        [sortBy, order]
      ],
    });
    res.json({
      data: teams.rows,
      totalCount: teams.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des équipes' , error: error.message });
  }
})
router.get('/teams/:teamId/players', authenticateJWT, async (req, res) => {
  try {
    const players = await getPlayersByTeamId(req.params.teamId);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
  }
});
router.patch('/admin/teams/update-ranking/all', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await updateTeamStats()
    res.status(200).json({ message: 'Équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-datas/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await createOrUpdateTeams()
    res.status(200).json({ message: 'Données des équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-datas/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    const season = await getCurrentSeasonYear(61)
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await createOrUpdateTeams(team.id, season, 61, false, true)
    res.status(200).json({ message: 'Données des équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-ranking/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await updateTeamStats(team.id, 61)
    res.status(200).json({ message: 'Équipe mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-players/:id', authenticateJWT, async (req, res) => {
  try {
    logger.info(req.user)
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await updatePlayers(team.id, 61)
    res.status(200).json({ message: 'Joueurs mis à jour avec succès pour l\'equipe' + team.name });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.delete('/admin/teams/delete/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const teamId = req.params.id;
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Équipe non trouvée' });

    await team.destroy();
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
});


module.exports = router