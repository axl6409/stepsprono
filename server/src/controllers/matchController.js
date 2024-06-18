// server/src/controllers/matchController.js
const matchService = require('../services/matchService');
const { Match, Team } = require('../models');
const { Op, Sequelize } = require('sequelize');
const moment = require('moment-timezone');

/**
 * Retrieves and returns a match by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The match data for the specified ID.
 */
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.matchId);
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Retrieves and returns matches for a specific matchday with the corresponding teams.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} JSON response with the matches data for the specified matchday.
 */
exports.getMatchesByDay = async (req, res) => {
  try {
    const matchday = parseInt(req.params.matchday) || 1;
    const matchs = await Match.findAndCountAll({
      where: {
        matchday,
        status: {
          [Op.or]: ["FT", "AET", "PEN"]
        }
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.json({ data: matchs.rows });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Retrieves the passed matchdays based on the current date.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Array} An array of unique matchdays that have already passed.
 */
exports.getPassedMatchdays = async (req, res) => {
  try {
    const currentDate = new Date();
    const matchdays = await Match.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('matchday')), 'matchday']
      ],
      where: {
        utcDate: {
          [Op.lt]: currentDate
        }
      },
      order: [['matchday', 'ASC']]
    });
    const uniqueMatchdays = matchdays.map(match => match.matchday);
    res.json(uniqueMatchdays);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matchdays', error: error.message });
  }
};

/**
 * Retrieves and returns the matches scheduled for the next week based on current date and time zone.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} JSON response with the list of matches for the next week, including start and end dates
 */
exports.getNextWeekMatches = async (req, res) => {
  try {
    const startOfNextWeek = moment().tz("Europe/Paris").add(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfNextWeek = moment().tz("Europe/Paris").add(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');

    const matchs = await Match.findAndCountAll({
      where: {
        utcDate: {
          [Op.gte]: startOfNextWeek,
          [Op.lte]: endOfNextWeek
        },
        status: {
          [Op.not]: 'SCHEDULED'
        }
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ],
      order: [['utcDate', 'ASC']]
    });

    if (matchs.count === 0) {
      return res.status(404).json({ message: 'Aucun match trouvé pour la semaine prochaine' });
    }

    res.json({ data: matchs.rows, totalCount: matchs.count, startOfNextWeek, endOfNextWeek });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error: error.message });
  }
};

/**
 * Retrieves and returns the matches scheduled for the current week based on the specified date.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} JSON response with the list of matches for the current week, including start and end dates
 */
exports.getCurrentWeekMatches = async (req, res) => {
  try {
    const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 });
    const startOfCurrentWeek = now.tz("Europe/Paris").startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfCurrentWeek = now.tz("Europe/Paris").endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const matchs = await Match.findAndCountAll({
      where: {
        utcDate: {
          [Op.gte]: startOfCurrentWeek,
          [Op.lte]: endOfCurrentWeek
        }
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ],
      order: [['utcDate', 'ASC']]
    });

    if (matchs.count === 0) {
      return res.status(404).json({ message: 'Aucun match trouvé pour cette semaine' });
    }

    res.json({ data: matchs.rows, totalCount: matchs.count, startOfCurrentWeek, endOfCurrentWeek });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error: error.message });
  }
};

/**
 * Deletes a match by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The success or error message after deleting the match.
 */
exports.deleteMatchById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const matchId = req.params.id;
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Équipe non trouvée' });

    await match.destroy();
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
};

/**
 * Retrieves and returns matches with no results based on a specific status.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} JSON response with the data of matches with no results.
 */
exports.getMatchesNoResults = async (req, res) => {
  try {
    const matchs = await Match.findAndCountAll({
      where: {
        status: "NS"
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.status(200).json({ data: matchs.rows });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates the match results by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} JSON response with the success message or error message.
 */
exports.updateMatchResultsById = async (req, res) => {
  try {
    const matchId = req.params.id;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Match non trouvé' });
    await matchService.updateMatchStatusAndPredictions(matchId);
    res.status(200).json({ message: 'Match mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Retrieves and returns matches that need to be updated.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} JSON response with the data of matches to be updated.
 */
exports.getMatchesToUpdate = async (req, res) => {
  try {
    const matchs = await Match.findAndCountAll({
      where: {
        scorers: null,
        status: "FT"
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.json({ data: matchs.rows });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates match data based on the provided match ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} JSON response with the updated match data or error message.
 */
exports.updateMatchDataById = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const matchId = req.params.id;
    if (isNaN(matchId)) {
      return res.status(400).json({ message: 'Identifiant de match non valide' });
    }
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Match non trouvé' });
    await matchService.updateMatchStatusAndPredictions(match.id);
    res.status(200).json({ message: 'Match mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates all matches based on certain conditions.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} JSON response with a success message or error message.
 */
exports.updateAllMatches = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await matchService.updateMatches();
    res.status(200).json({ message: 'Matchs mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};
