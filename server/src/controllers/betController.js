// server/src/controllers/betController.js
const betService = require('../services/betService');
const logger = require('../utils/logger/logger');

exports.getBets = async (req, res) => {
  try {
    const defaultLimit = 10;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    let offset = (page - 1) * limit;
    if (!req.query.page && !req.query.limit) {
      limit = null;
      offset = null;
    }
    const bets = await betService.getBets({ offset, limit });
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.getNullBets = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await betService.getNullBets();
    if (!bets) return res.status(404).json({ message: 'Aucun pronostic n\'est null' });
    res.status(200).json({ bets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.addBet = async (req, res) => {
  try {
    const bet = await betService.createBet(req.body);
    logger.info(req.body);
    res.status(200).json(bet);
  } catch (error) {
    if (error.message === 'Match non trouvé' || error.message === 'Un prono existe déjà pour ce match') {
      res.status(404).json({ error: error.message });
    } else if (error.message.startsWith('Le score n\'est pas valide')) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Impossible d\'enregistrer le prono', message: error.message });
    }
  }
};

exports.getUserBets = async (req, res) => {
  try {
    const matchIds = req.body.matchIds;
    const bets = await betService.getUserBets(req.params.id, matchIds);
    res.json({ data: bets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.deleteBet = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    await betService.deleteBet(req.params.id);
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
};

exports.getUncheckedBets = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await betService.getNullBets();
    if (!bets) return res.status(404).json({ message: 'Aucun pronostic n\'est null' });
    res.status(200).json({ bets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.checkupAllBets = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await betService.checkupBets();
    if (bets.success === false) return res.status(403).json({ error: bets.error, message: bets.message });
    res.status(200).json({ message: bets.message, datas: bets.updatedBets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.checkupBetById = async (req, res) => {
  try {
    const betId = req.params.betId;
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bet = await betService.checkBetByMatchId(betId);
    if (bet.success === false) return res.status(403).json({ error: bet.error, message: bet.message });
    res.status(200).json({ message: bet.message, datas: bet.updatedBets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.updateBet = async (req, res) => {
  try {
    const bet = await betService.updateBet({ id: req.params.betId, ...req.body });
    res.status(200).json(bet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
