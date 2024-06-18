// server/src/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/match/:matchId', authenticateJWT, matchController.getMatchById);
router.get('/matchs/day/:matchday', authenticateJWT, matchController.getMatchesByDay);
router.get('/matchs/days/passed', authenticateJWT, matchController.getPassedMatchdays);
router.get('/matchs/next-week', authenticateJWT, matchController.getNextWeekMatches);
router.get('/matchs/current-week', authenticateJWT, matchController.getCurrentWeekMatches);
router.delete('/admin/matchs/delete/:id', authenticateJWT, matchController.deleteMatchById);
router.get('/admin/matchs/no-results', authenticateJWT, matchController.getMatchesNoResults);
router.patch('/admin/matchs/update/results/:id', authenticateJWT, matchController.updateMatchResultsById);
router.get('/admin/matchs/datas/to-update', authenticateJWT, matchController.getMatchesToUpdate);
router.patch('/admin/matchs/datas/to-update/:id', authenticateJWT, matchController.updateMatchDataById);
router.patch('/admin/matchs/update-all', authenticateJWT, matchController.updateAllMatches);

module.exports = router;
