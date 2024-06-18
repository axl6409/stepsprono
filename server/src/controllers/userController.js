// server/src/controllers/userController.js
const userService = require('../services/userService');
const { upload } = require('../utils/utils');
const bcrypt = require('bcrypt');

exports.getPendingUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const users = await userService.findPendingUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

exports.getAllUsersSimple = async (req, res) => {
  try {
    const users = await userService.findAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body, req.file);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour l\'utilisateur: ' + error.message });
  }
};

exports.requestUserRole = async (req, res) => {
  try {
    const result = await userService.requestUserRole(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de soumettre la requête: ' + error.message });
  }
};

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

exports.getFilteredBets = async (req, res) => {
  try {
    const bets = await userService.getFilteredBets(req.params.id, req.params.filter);
    res.json(bets);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics: ' + error.message });
  }
};

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

exports.getUserRewards = async (req, res) => {
  try {
    const rewards = await userService.getUserRewards(req.params.id);
    res.status(200).json({ rewards });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur', message: error.message });
  }
};
