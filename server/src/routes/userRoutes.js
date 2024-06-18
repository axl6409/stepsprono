// server/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require("../middlewares/auth");

router.get('/admin/users/requests', authenticateJWT, userController.getPendingUsers);
router.get('/admin/users', authenticateJWT, userController.getAllUsers);
router.get('/users/all', authenticateJWT, userController.getAllUsersSimple);
router.get('/user/:id', authenticateJWT, userController.getUserById);
router.put('/user/update/:id', authenticateJWT, userController.updateUser);
router.patch('/user/:id/request-role', authenticateJWT, userController.requestUserRole);
router.get('/user/:id/bets/last', authenticateJWT, userController.getLastBets);
router.get('/user/:id/bets/:filter', authenticateJWT, userController.getFilteredBets);
router.post('/user/verify-password', authenticateJWT, userController.verifyPassword);
router.get('/user/:id/rewards', authenticateJWT, userController.getUserRewards);
router.delete('/admin/user/delete/:id', authenticateJWT, userController.deleteUser);

module.exports = router;
