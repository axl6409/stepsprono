// server/src/controllers/authController.js
const authService = require('../services/authService');
const { User, Role } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const sharp = require('sharp');
const logger = require('../utils/logger/logger');
const secretKey = process.env.SECRET_KEY;

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
