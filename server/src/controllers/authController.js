const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY
const {User, Role} = require("../models");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const { upload } = require('../utils/utils');

router.post('/verifyToken', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ isAuthenticated: false, datas: req.body });
  try {
    const payload = jwt.verify(token, secretKey);
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
});
router.post('/register', upload.single('profilePic'), async (req, res) => {
  try {
    const { username, email, password, teamId } = req.body;

    const usernameExists = await User.findOne({ where: { username } });
    const emailExists = await User.findOne({ where: { email } });

    if (usernameExists || emailExists) {
      return res.status(400).json({ error: 'Le nom d’utilisateur ou l\'email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      img: req.file ? req.file.path : null,
      teamId
    });

    const [userRole, created] = await Role.findOrCreate({ where: { name: 'visitor' } });
    await user.addRole(userRole);

    const token = jwt.sign({ userId: user.id, role: userRole.name }, secretKey, { expiresIn: '365d' });

    res.status(201).json({ message: 'Utilisateur créé avec succès', user, token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error });
  }
})
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Utilisateur inconnu' });

    const userRoles = await user.getRoles();
    const userRole = userRoles && userRoles.length > 0 ? userRoles[0].name : 'user';

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ userId: user.id, role: userRole }, secretKey, { expiresIn: '365d' });

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
})

module.exports = router