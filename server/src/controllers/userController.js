// server/src/controllers/userController.js
const userService = require('../services/userService');
const { upload } = require('../utils/utils');
const bcrypt = require('bcrypt');

/**
 * Retrieves pending users if the request user is an admin.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the pending users or an error message.
 */
exports.getPendingUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const users = await userService.findPendingUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves all users based on their roles if the requesting user is an admin or a manager.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the users with specified roles or an error message.
 */
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const roles = req.query.roles;
    const users = await userService.findAllUsersWithRoles(roles);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves all users simplistically and returns them as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the users or an error message.
 */
exports.getAllUsersSimple = async (req, res) => {
  try {
    const users = await userService.findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieves a user by their ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the user found by ID or an error message.
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Updates a user based on the provided request parameters, body, and file.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the updated user information or an error message.
 */
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body, req.file);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour l\'utilisateur: ' + error.message });
  }
};

/**
 * Processes a user role request and returns the result.
 *
 * @param {Object} req - The request object containing user ID.
 * @param {Object} res - The response object for sending the result.
 * @return {Promise} JSON response containing the result or an error message.
 */
exports.requestUserRole = async (req, res) => {
  try {
    const result = await userService.requestUserRole(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de soumettre la requête: ' + error.message });
  }
};

/**
 * Retrieves the last bets for a user based on the provided ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the last bets or an error message.
 */
exports.getLastBets = async (req, res) => {
  try {
    const bets = await userService.getLastBets(req.params.id);
    if (bets.length === 0) {
      res.json({ message: 'Aucun pari pour la semaine en cours' });
    } else {
      res.json(bets);
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics: ' + error.message });
  }
};

/**
 * Retrieves and returns filtered bets based on the provided ID and filter.
 *
 * @param {string} id - The ID used to filter bets.
 * @param {string} filter - The filter criteria for selecting bets.
 * @return {Promise} The filtered bets retrieved from the database.
 */
exports.getFilteredBets = async (req, res) => {
  try {
    const bets = await userService.getFilteredBets(req.params.id, req.params.filter);
    res.json(bets);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics: ' + error.message });
  }
};

/**
 * Verifies the user's password.
 *
 * @param {Object} req - The request object containing userId and currentPassword
 * @param {Object} res - The response object
 * @return {Promise} JSON response indicating the success or failure of password verification
 */
exports.verifyPassword = async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;
    const isValid = await userService.verifyPassword(userId, currentPassword);
    if (!isValid) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    res.status(200).json({ message: 'Mot de passe actuel correct' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe' });
  }
};

/**
 * Retrieves the user rewards based on the provided ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response containing the user rewards or an error message.
 */
exports.getUserRewards = async (req, res) => {
  try {
    const rewards = await userService.getUserRewards(req.params.id);
    res.status(200).json({ rewards });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

/**
 * Deletes a user based on the provided ID if the requesting user is an admin or a manager.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise} JSON response indicating the success or failure of user deletion.
 */
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur', message: error.message });
  }
};
