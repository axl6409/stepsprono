// server/src/routes/competitionRoutes.js
const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/competitions', authenticateJWT, competitionController.getCompetitions);
router.get('/competitions/by-country/:code', authenticateJWT, competitionController.getCompetitionsByCountry);

module.exports = router;
