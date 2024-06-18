// server/src/controllers/betController.js
const betService = require('../services/betService');
const logger = require('../utils/logger/logger');

/**
 * Retrieves bets based on the provided query parameters and sends a JSON response with the retrieved bets.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The retrieved bets in a JSON format
 */
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

/**
 * Retrieves null bets based on the user's role and sends a JSON response with the retrieved bets or appropriate errors.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The retrieved null bets in a JSON format or error messages
 */
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

/**
 * Adds a new bet based on the request body, logs the request body, and returns the created bet in a JSON format.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The created bet in a JSON format
 */
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

/**
 * Retrieves user bets based on the provided match IDs, and sends a JSON response with the retrieved bets.
 *
 * @param {Object} req - The request object containing matchIds
 * @param {Object} res - The response object
 * @return {Object} The retrieved user bets in a JSON format
 */
exports.getUserBets = async (req, res) => {
  try {
    const matchIds = req.body.matchIds;
    const bets = await betService.getUserBets(req.params.id, matchIds);
    res.json({ data: bets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Deletes a bet based on the request parameters and user role, and returns a success message or error response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} A JSON response indicating the success or failure of the bet deletion
 */
exports.deleteBet = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    await betService.deleteBet(req.params.id);
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
};

/**
 * Retrieves unchecked bets based on the user's role and sends a JSON response with the retrieved bets or appropriate errors.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The retrieved unchecked bets in a JSON format or error messages
 */
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

/**
 * Retrieves all bets, checks their status, and returns a JSON response with the updated bets or appropriate errors.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} A JSON response with the updated bets or error messages
 */
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

/**
 * Function to check a bet by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response with the result of the bet check.
 */
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

/**
 * Updates a bet based on the request body, logs the request body, and returns the updated bet in a JSON format.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The updated bet in a JSON format
 */
exports.updateBet = async (req, res) => {
  try {
    const bet = await betService.updateBet({ id: req.params.betId, ...req.body });
    res.status(200).json(bet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
