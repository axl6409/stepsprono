const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const {Role} = require("../models");

require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from Bearer
  if (!token) {
    return res.status(401).json({ error: 'Token is missing from Authorization header' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      let errorMsg = 'Invalid token';
      if (err.name === 'TokenExpiredError') errorMsg = 'Token has expired';
      return res.status(403).json({ error: errorMsg });
    }

    req.user = user;
    next();
  });
};

// Define a GET routes
router.get('/data', (req, res) => {
  // Perform some operation (e.g., fetch data from a database)
  // Send a JSON response to the client
  res.json({ message: 'Data from the server' });
});
router.get('/login', (req, res) => {
  res.json({ message: 'login page'})
})
router.post('/verifyToken', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ isAuthenticated: false, datas: req.body });
  try {
    const payload = jwt.verify(token, secretKey);
    const user = await User.findOne({ where: { id: payload.userId }, include: Role });
    if (!user) return res.status(401).json({ isAuthenticated: false });

    const userWithRole = {
      ...user.get({ plain: true }),
      role: user.Roles && user.Roles.length > 0 ? user.Roles[0].name : 'user', // suppose que chaque utilisateur a un rôle
    };

    res.json({ isAuthenticated: true, user: userWithRole });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false, token, error: error.message });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const usernameExists = await User.findOne({ where: { username } });
    const emailExists = await User.findOne({ where: { email } });

    if (usernameExists && emailExists) {
      return res.status(400).json({ error: 'Le nom d’utilisateur et le mail existent déjà.' });
    } else if (usernameExists) {
      return res.status(400).json({ error: 'Le nom d\'utilisateur est déjà utilisé'});
    } else if (emailExists) {
      return res.status(400).json({ error: 'Ce mail est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    })

    const [userRole, created] = await Role.findOrCreate({ where: { name: 'user' } });
    if (!userRole) return res.status(500).json({ error: 'Rôle utilisateur non trouvé' })
    await user.addRole(userRole);

    const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, { expiresIn: '365d' });

    res.set('Cache-Control', 'no-store');
    const cookieConfig = {
      secure: true,
      httpOnly: true,
      sameSite: 'Strict'
    };
    // if (process.env.NODE_ENV !== 'production') {
    //   cookieConfig.secure = false; // En mode développement (HTTP), définissez secure sur false
    // }
    res.cookie('token', token, cookieConfig);

    res.status(201).json({ message: 'Utilisateur créé avec succès', user, token })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message })
  }
})
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Utilisateur inconnu' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, { expiresIn: '365d' });

    res.set('Cache-Control', 'no-store');
    const cookieConfig = {
      secure: true,
      httpOnly: true,
      sameSite: 'Strict'
    };
    // if (process.env.NODE_ENV !== 'production') {
    //   cookieConfig.secure = false; // En mode développement (HTTP), définissez secure sur false
    // }
    res.cookie('token', token, cookieConfig);

    res.status(200).json({ message: 'Connexion réussie', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

router.get('/dashboard', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

router.get('/admin/users', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const users = await User.findAll({ include: Role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;