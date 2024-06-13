const axios = require("axios");
const moment = require("moment-timezone");
const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const {getAPICallsCount, getSettlement} = require("../services/appService");
const {Setting, Role, Match, Team} = require("../models");
const {getCronTasks} = require("../../cronJob");
const {fetchWeekMatches, getMatchsCronTasks} = require("../services/matchService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

router.get('/admin/settings', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put('/admin/setting/update/:id', authenticateJWT, async (req, res) => {
  try {
    const setting = await Setting.findByPk(req.params.id);
    if (!setting) return res.status(404).json({ error: 'Réglage non trouvé' });

    const type = setting.type;
    if (type === 'select') {
      setting.activeOption = req.body.newValue;
    } else if (type === 'text') {
      const newOptions = { ...setting.options }
      newOptions['Value'] = req.body.newValue
      setting.options = newOptions
    }
    await setting.save();
    res.status(200).json(setting);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour le réglage' + error });
  }
});
router.get('/admin/roles', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
router.get('/admin/matchs/to-update', authenticateJWT, async (req, res) => {
  try {
    const matchs = await Match.findAndCountAll({
      where: {
        scorers: null,
        status: "FT",
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.json({
      data: matchs.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.get('/admin/matchs/program-tasks', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    await fetchWeekMatches();
    res.status(200).json({ message: 'Programmation des matchs effectuée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la programmation des tâches', message: error.message });
  }
})
router.get('/admin/matchs/cron-tasks', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const cronTasks = await getMatchsCronTasks();
    res.status(200).json({ tasks: cronTasks });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la programmation des tâches', message: error.message });
  }
})
router.get('/app/calls', authenticateJWT, async (req, res) => {
  try {
    const calls = await getAPICallsCount();
    res.status(200).json({ calls });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.get('/app/cron-jobs/scheduled', authenticateJWT, async (req, res) => {
  try {
    const cronJobs = await getCronTasks();
    res.status(200).json({ cronJobs });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.get('/app/reglement', authenticateJWT, async (req, res) => {
  try {
    const settlement = await getSettlement();
    if (!settlement) {
      return res.status(404).json({ message: 'Règlement non trouvé' });
    }
    res.json(settlement);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
})


module.exports = router;