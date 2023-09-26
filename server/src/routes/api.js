const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

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

router.post('/verifyToken', (req, res) => {
  console.log(req.body)
  const { token } = req.body;

  if (!token) return res.status(401).json({ isAuthenticated: false });

  try {
    const user = jwt.verify(token, secretKey);
    res.json({ isAuthenticated: true, user });
  } catch (error) {
    res.status(401).json({ isAuthenticated: false });
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
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

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

    res.status(201).json({ message: 'User created successfully', user, token })
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

router.get('/test', (req, res, next) => {
  authenticateJWT(req, res, (err) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' }); // if error, it is unauthorized
    next();
  });
}, (req, res) => {
  res.json({ message: 'This is a test route' });
});

module.exports = router;