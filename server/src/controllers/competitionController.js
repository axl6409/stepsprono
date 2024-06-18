// server/src/controllers/competitionController.js
const competitionService = require('../services/competitionService');
const { Competition } = require('../models');

exports.getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.findAll();
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.getCompetitionsByCountry = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const competitions = await competitionService.getCompetitionsByCountry(req.params.code);
    res.status(200).json({ competitions });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des compétitions', message: error.message });
  }
};
