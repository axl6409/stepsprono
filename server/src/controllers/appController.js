// server/src/controllers/appController.js
const appService = require('../services/appService');

exports.getSettings = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const settings = await appService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const setting = await appService.updateSetting(req.params.id, req.body.newValue);
    if (!setting) return res.status(404).json({ error: 'Réglage non trouvé' });
    res.status(200).json(setting);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour le réglage ' + error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const roles = await appService.getRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.programMatchTasks = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    await appService.programMatchTasks();
    res.status(200).json({ message: 'Programmation des matchs effectuée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la programmation des tâches', message: error.message });
  }
};

exports.getMatchCronTasks = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const cronTasks = await appService.getMatchCronTasks();
    res.status(200).json({ tasks: cronTasks });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la programmation des tâches', message: error.message });
  }
};

exports.getApiCalls = async (req, res) => {
  try {
    const calls = await appService.getAPICallsCount();
    res.status(200).json({ calls });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.getCronJobs = async (req, res) => {
  try {
    const cronJobs = await appService.getCronTasks();
    res.status(200).json({ cronJobs });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.getSettlement = async (req, res) => {
  try {
    const settlement = await appService.getSettlement();
    if (!settlement) {
      return res.status(404).json({ message: 'Règlement non trouvé' });
    }
    res.json(settlement);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
