// server/src/controllers/authController.js
const authService = require('../services/authService');
const { User, Role } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const sharp = require('sharp');
const logger = require('../utils/logger/logger');
const secretKey = process.env.SECRET_KEY;

/**
 * Verifies the token provided in the request, retrieves user information based on the token payload,
 * and returns the user data with role information if the user is authenticated.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Object} JSON object containing user authentication status and user data with role information
 */
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = authService.verifyToken(token, secretKey);
    const user = await User.findOne({ where: { id: payload.userId }, include: Role });
    if (!user) return res.status(401).json({ isAuthenticated: false });

    const userWithRole = {
      ...user.get({ plain: true }),
      role: user.Roles && user.Roles.length > 0 ? user.Roles[0].name : 'user',
    };

    res.json({ isAuthenticated: true, user: userWithRole });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false, token, error: error.message });
  }
};

/**
 * Registers a new user with the provided username, email, password, and teamId.
 *
 * @param {Object} req - The request object containing user information
 * @param {Object} res - The response object for sending back the result
 * @return {Object} JSON response with the status of user registration
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, teamId } = req.body;
    let img = req.file;

    const userExists = await authService.checkUserExists(username, email);
    if (userExists) {
      return res.status(400).json({ error: 'Le nom d’utilisateur ou l\'email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (req.file) {
      img = await authService.processProfileImage(req.file.path);
    }

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      img,
      teamId,
      status: 'pending'
    });

    const token = await authService.assignRoleAndGenerateToken(user, 'visitor', secretKey);

    logger.info('Utilisateur enregistré avec succès', user);
    res.status(201).json({ message: 'Utilisateur créé avec succès', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error });
  }
};

/**
 * Handles user login by verifying credentials, generating a token, and setting cookie configurations.
 *
 * @param {Object} req - The request object containing username and password
 * @param {Object} res - The response object for sending back the login result
 * @return {Object} JSON response with the user login status and token
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Utilisateur inconnu' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = await authService.generateTokenForUser(user, secretKey);

    res.set('Cache-Control', 'no-store');
    const cookieConfig = {
      secure: true,
      httpOnly: true,
      sameSite: 'Strict'
    };
    res.cookie('token', token, cookieConfig);

    res.status(200).json({ message: 'Connexion réussie', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};
