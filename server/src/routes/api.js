const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { expressjwt } = require("express-jwt");

require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

const authenticateJWT = expressjwt({ secret: secretKey, algorithms: ['HS256'] });

// Define a GET route
router.get('/data', (req, res) => {
  // Perform some operation (e.g., fetch data from a database)
  // Send a JSON response to the client
  res.json({ message: 'Data from the server' });
});
router.get('/login', (req, res) => {
  res.json({ message: 'login page'})
})

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const usernameExists = await User.findOne({ where: { username } });
    const emailExists = await User.findOne({ where: { email } });

    if (usernameExists && emailExists) {
      return res.status(400).json({ error: 'Le nom d’utilisateur et le mail existent déjà.' });
    } else if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists' });
    } else if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    })
    res.status(201).json({ message: 'User created successfully', user })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { userId: user.id },
      secretKey,
      { expiresIn: '1h' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, //process.env.NODE_ENV !== 'development'
      sameSite: 'Strict'
    });

    res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});

router.get('/dashboard', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

module.exports = router;
