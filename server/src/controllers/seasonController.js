// server/src/controllers/seasonController.js
const seasonService = require('../services/seasonService');

/**
 * Retrieves the current season for a specific competition and sends it as a JSON response.
 *
 * @param {Object} req - The request object containing the competition parameter
 * @param {Object} res - The response object to send the current season as JSON
 * @return {Object} The current season for the specified competition in a JSON response
 */
exports.getCurrentSeason = async (req, res) => {
  try {
    const competition = req.params.competition;
    const currentSeason = seasonService.getCurrentSeasonId(competition);
    res.status(200).json({ currentSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
  }
};
