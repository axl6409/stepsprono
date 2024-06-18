// server/src/routes/playerRoutes.js
const express = require('express');
const { authenticateJWT } = require("../middlewares/auth");
const playerController = require('../controllers/playerController');
const router = express.Router();

router.get('/player/:id', authenticateJWT, playerController.getPlayerById);
router.get('/players', authenticateJWT, playerController.getPlayers);

module.exports = router;
