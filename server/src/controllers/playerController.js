// server/src/controllers/playerController.js
const playerService = require('../services/playerService');

/**
 * Retrieves a player by their ID and sends the player data as a JSON response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The player data as a JSON response
 */
exports.getPlayerById = async (req, res) => {
  try {
    const playerId = req.params.id;
    if (!playerId) {
      return res.status(400).send('Aucun identifiant d\'équipe fourni');
    }
    const player = await playerService.getPlayerById(playerId);
    res.json(player);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs :', error);
    res.status(500).send(error);
  }
};

/**
 * Retrieves players based on team IDs provided in the request query parameters.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} The players retrieved based on the query condition
 */
exports.getPlayers = async (req, res) => {
  try {
    const teamId1 = req.query.teamId1;
    const teamId2 = req.query.teamId2;
    let queryCondition;
    if (teamId1 && teamId2) {
      queryCondition = { teamId: [teamId1, teamId2] };
    } else if (teamId1 || teamId2) {
      queryCondition = { teamId: teamId1 || teamId2 };
    } else {
      return res.status(400).send('Aucun identifiant d\'équipe fourni');
    }
    const players = await playerService.getPlayers(queryCondition);
    res.json(players);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs :', error);
    res.status(500).send('Erreur interne du serveur');
  }
};
