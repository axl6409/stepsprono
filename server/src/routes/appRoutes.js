// server/src/routes/appRoutes.js
const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/admin/settings', authenticateJWT, appController.getSettings);
router.put('/admin/setting/update/:id', authenticateJWT, appController.updateSetting);
router.get('/admin/roles', authenticateJWT, appController.getRoles);
router.get('/admin/matchs/program-tasks', authenticateJWT, appController.programMatchTasks);
router.get('/admin/matchs/cron-tasks', authenticateJWT, appController.getMatchCronTasks);
router.get('/app/calls', authenticateJWT, appController.getApiCalls);
router.get('/app/cron-jobs/scheduled', authenticateJWT, appController.getCronJobs);
router.get('/app/reglement', authenticateJWT, appController.getSettlement);

module.exports = router;
