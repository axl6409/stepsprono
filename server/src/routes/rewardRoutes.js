// server/src/routes/rewardRoutes.js
const express = require('express');
const { authenticateJWT } = require("../middlewares/auth");
const rewardController = require('../controllers/rewardController');
const router = express.Router();

router.get('/rewards', authenticateJWT, rewardController.getAllRewards);
router.get('/rewards/user/:userId', authenticateJWT, rewardController.getAllUserRewards);
router.post('/rewards/check-match', authenticateJWT, rewardController.checkMatchRewards);
router.get('/rewards/check-daily', authenticateJWT, rewardController.checkDailyRewards);
router.get('/rewards/check-weekly', authenticateJWT, rewardController.checkWeeklyChampion);
router.get('/rewards/check-monthly', authenticateJWT, rewardController.checkMonthlyRewards);
router.get('/rewards/check-season', authenticateJWT, rewardController.checkSeasonRewards);

module.exports = router;
