// server/src/controllers/teamController.js
const { getPlayersByTeamId, updatePlayers } = require("../services/playerService");
const { updateTeamsRanking, createOrUpdateTeams } = require("../services/teamService");
const { getCurrentSeasonYear } = require("../services/seasonService");
const { Team, TeamCompetition } = require("../models");
const logger = require("../utils/logger/logger");

/**
 * Retrieves teams based on sorting criteria and returns them as JSON response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} JSON response containing teams' data and count
 */
exports.getTeams = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'position';
    const order = req.query.order || 'ASC';

    const teams = await TeamCompetition.findAndCountAll({
      include: [{
        model: Team,
        as: 'Team',
        required: true
      }],
      order: [
        [sortBy, 'ASC']
      ],
    });
    res.json({
      data: teams.rows,
      totalCount: teams.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des équipes' , error: error.message });
  }
};

/**
 * Retrieves players by team ID and sends them as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} The JSON response containing the players.
 */
exports.getPlayersByTeamId = async (req, res) => {
  try {
    const players = await getPlayersByTeamId(req.params.teamId);
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
  }
};

/**
 * Updates the ranking of teams based on certain conditions.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response indicating the success or failure of updating teams' ranking.
 */
exports.updateTeamsRanking = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await updateTeamsRanking()
    res.status(200).json({ message: 'Équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates the team data based on certain conditions.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response indicating the success or failure of updating team data.
 */
exports.updateTeamsDatas = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await createOrUpdateTeams()
    res.status(200).json({ message: 'Données des équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates the team data based on certain conditions.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response indicating the success or failure of updating team data.
 */
exports.updateTeamDatasById = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    const season = await getCurrentSeasonYear(61)
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await createOrUpdateTeams(team.id, season, 61, true, true)
    res.status(200).json({ message: 'Données des équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates the team ranking by ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response indicating the success or failure of updating team ranking.
 */
exports.updateTeamRankingById = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await updateTeamsRanking(team.id, 61)
    res.status(200).json({ message: 'Équipe mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates players for a team based on the team ID provided in the request.
 *
 * @param {Object} req - The request object containing user information and team ID.
 * @param {Object} res - The response object used to send success or error messages.
 * @return {Promise} JSON response indicating the success or failure of updating players for the team.
 */
exports.updatePlayersByTeamId = async (req, res) => {
  try {
    logger.info(req.user)
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await updatePlayers(team.id, 61)
    res.status(200).json({ message: 'Joueurs mis à jour avec succès pour l\'équipe' + team.name });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Deletes a team by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response indicating the success or failure of team deletion.
 */
exports.deleteTeamById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const teamId = req.params.id;
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Équipe non trouvée' });

    await team.destroy();
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
};