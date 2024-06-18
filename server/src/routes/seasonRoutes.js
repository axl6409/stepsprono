// server/src/routes/seasonRoutes.js
const express = require('express');
const { authenticateJWT } = require("../middlewares/auth");
const seasonController = require('../controllers/seasonController');
const router = express.Router();

router.get('/seasons/current/:competition', seasonController.getCurrentSeason);

module.exports = router;
