// server/src/routes/betRoutes.js
const express = require('express');
const router = express.Router();
const betController = require('../controllers/betController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/bets', authenticateJWT, betController.getBets);
router.get('/bets/get-null/all', authenticateJWT, betController.getNullBets);
router.post('/bet/add', authenticateJWT, betController.addBet);
router.post('/bets/user/:id', authenticateJWT, betController.getUserBets);
router.delete('/admin/bets/delete/:id', authenticateJWT, betController.deleteBet);
router.get('/admin/bets/unchecked', authenticateJWT, betController.getUncheckedBets);
router.patch('/admin/bets/checkup/all', authenticateJWT, betController.checkupAllBets);
router.patch('/admin/bets/checkup/:betId', authenticateJWT, betController.checkupBetById);
router.patch('/bet/update/:betId', authenticateJWT, betController.updateBet);

module.exports = router;
