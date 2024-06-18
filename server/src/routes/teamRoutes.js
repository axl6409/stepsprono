// server/src/routes/teamRoutes.js
const express = require('express');
const { authenticateJWT } = require("../middlewares/auth");
const teamController = require('../controllers/teamController');
const router = express.Router();

router.get('/teams', teamController.getTeams);
router.get('/teams/:teamId/players', authenticateJWT, teamController.getPlayersByTeamId);
router.patch('/admin/teams/update-ranking/all', authenticateJWT, teamController.updateTeamsRanking);
router.patch('/admin/teams/update-datas/', authenticateJWT, teamController.updateTeamsDatas);
router.patch('/admin/teams/update-datas/:id', authenticateJWT, teamController.updateTeamDatasById);
router.patch('/admin/teams/update-ranking/:id', authenticateJWT, teamController.updateTeamRankingById);
router.patch('/admin/teams/update-players/:id', authenticateJWT, teamController.updatePlayersByTeamId);
router.delete('/admin/teams/delete/:id', authenticateJWT, teamController.deleteTeamById);

module.exports = router;
