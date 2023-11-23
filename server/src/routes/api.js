const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { Op, Sequelize} = require('sequelize')
const jwt = require('jsonwebtoken')
const moment = require('moment-timezone')
moment.tz.setDefault("Europe/Paris");
const {User, Role, Teams, Competition, Team, Match, Bets, Settings } = require("../models")
const axios = require('axios')
const multer = require("multer");
const path = require("path");
const {mkdirSync} = require("fs");
require('dotenv').config()
const secretKey = process.env.SECRET_KEY
const sharp = require('sharp')

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dest = path.join('..', '/client/src/assets/uploads/users/', req.params.id);
    mkdirSync(dest, { recursive: true }); // Crée le dossier s'il n'existe pas
    cb(null, dest);
  },

  filename: function(req, file, cb) {
    const randomString = generateRandomString(10);
    cb(null, 'pp_img_' + req.params.id + '_' + randomString + path.extname(file.originalname));
  }
});

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
const upload = multer({ storage: storage });

// Define GET routes
router.get('/competitions', authenticateJWT, async (req, res) => {
  try {
    const competitions = await Competition.findAll();
    res.json(competitions);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée' , error: error.message });
  }
})
router.get('/dashboard', authenticateJWT, (req, res) => {
  res.json({ message: 'Route protégée' });
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
router.get('/admin/user/:id', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
  }
});
router.get('/admin/settings', authenticateJWT, async (req, res) => {
  try {
    // Vérifiez si l'utilisateur est admin ou manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const settings = await Settings.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/settings/reglement', authenticateJWT, async (req, res) => {
  try {
    const setting = await Settings.findOne({ where: { key: 'regulation' } });
    if (!setting) {
      return res.status(404).json({ message: 'Règlement non trouvé' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});
router.get('/teams', authenticateJWT, async (req, res) => {
  try {
    const defaultLimit = 10;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    let offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'position';
    const order = req.query.order || 'ASC';

    if (!req.query.page && !req.query.limit) {
      limit = null;
      offset = null;
    }

    const teams = await Team.findAndCountAll({
      offset,
      limit,
      order: [[sortBy, order.toUpperCase()]]
    });
    res.json({
      data: teams.rows,
      totalPages: limit ? Math.ceil(teams.count / limit) : 1,
      currentPage: page,
      totalCount: teams.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée' , error: error.message });
  }
});
router.get('/matches', authenticateJWT, async (req, res) => {
  try {
    const defaultLimit = 10;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    let offset = (page - 1) * limit;
    if (!req.query.page && !req.query.limit) {
      limit = null;
      offset = null;
    }
    const matchs = await Match.findAndCountAll({
      offset,
      limit,
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.json({
      data: matchs.rows,
      totalPages: limit ? Math.ceil(matchs.count / limit) : 1,
      currentPage: page,
      totalCount: matchs.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée' , error: error.message });
  }
});
router.get('/match/:matchId', authenticateJWT, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.matchId);
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
  }
})
router.get('/matchs/day/:matchday', authenticateJWT, async (req, res) => {
  try {
    let matchday = parseInt(req.params.matchday) || 1;
    const currentDate = new Date()
    const matchs = await Match.findAndCountAll({
      where: {
        matchday: matchday,
        status: {
          [Op.or]: ["FT", "AET", "PEN"]
        },
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.json({
      data: matchs.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.get('/matchs/days/passed', authenticateJWT, async (req, res) => {
  try {
    const currentDate = new Date();
    const matchdays = await Match.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('matchday')), 'matchday'],
      ],
      where: {
        utcDate: {
          [Op.lt]: currentDate
        }
      },
      order: [
        ['matchday', 'ASC']
      ]
    });
    const uniqueMatchdays = matchdays.map(match => match.matchday);
    res.json(uniqueMatchdays);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matchdays', error: error.message });
  }
});
router.get('/matchs/next-weekend', authenticateJWT, async (req, res) => {
  try {
    const today = moment().tz("Europe/Paris").format('YYYY-MM-DD HH:mm:ss');
    const nextMatch = await Match.findOne({
      where: {
        utcDate: {
          [Op.gte]: today
        },
        status: {
          [Op.not]: 'SCHEDULED'
        }
      },
      order: [
        ['utcDate', 'ASC']
      ]
    });
    if (!nextMatch) {
      return res.status(404).json({ message: 'Aucun match trouvé' });
    }
    const matchday = nextMatch.matchday;
    const matchs = await Match.findAndCountAll({
      where: {
        matchday: matchday,
        status: {
          [Op.not]: 'SCHEDULED'
        }
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    });
    res.json({
      data: matchs.rows,
      totalCount: matchs.count,
      today: today,
      nextMatchday: matchday
    });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.get('/matchs/by-week', authenticateJWT, async (req, res) => {
  try {
    const defaultLimit = 10;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    let offset = (page - 1) * limit;

    const startOfWeek = moment().tz("Europe/Paris").startOf('week').add((page - 1) * 7, 'days').format('YYYY-MM-DD HH:mm:ss');
    const endOfWeek = moment().tz("Europe/Paris").startOf('week').add(page * 7 - 1, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss');

    const matchs = await Match.findAndCountAll({
      where: {
        utcDate: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek
        }
      },
      offset,
      limit,
    });

    res.json({
      data: matchs.rows,
      totalPages: limit ? Math.ceil(matchs.count / limit) : 1,
      currentPage: page,
      totalCount: matchs.count,
      startOfWeek: startOfWeek,
      endOfWeek: endOfWeek,
    });

  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.get('/bets', authenticateJWT, async (req, res) => {
  try {
    const defaultLimit = 10;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;
    let offset = (page - 1) * limit;
    if (!req.query.page && !req.query.limit) {
      limit = null;
      offset = null;
    }
    const bets = await Bets.findAndCountAll({
      offset,
      limit,
      include: [
        { model: Team, as: 'Winner' }
      ]
    });
    res.json({
      data: bets.rows,
      totalPages: limit ? Math.ceil(bets.count / limit) : 1,
      currentPage: page,
      totalCount: bets.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée' , error: error.message });
  }
})

// Define POST routes
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

    const [userRole, created] = await Role.findOrCreate({ where: { name: 'visitor' } });
    if (!userRole) return res.status(500).json({ error: 'Rôle utilisateur non trouvé' })
    await user.addRole(userRole);

    const token = jwt.sign({ userId: user.id, role: userRole.name }, secretKey, { expiresIn: '365d' });

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
router.post('/admin/teams/add', async (req, res) => {
  try {
    const existingTeam = await Team.findOne({ where: { slug: req.body.slug } });
    if (existingTeam) {
      return res.status(400).json({ error: 'Une équipe avec ce nom existe déjà' })
    }
    const team = await Team.create(req.body)
    res.status(201).json(team)
  } catch (error) {
    res.status(400).json({ error: 'Impossible de créer l’équipe', message: error })
  }
})
router.post('/admin/matchs/add', async (req, res) => {
  try {
    const date = req.body.date
    const homeTeam = parseInt(req.body.homeTeam, 10)
    const awayTeam = parseInt(req.body.awayTeam, 10)
    const existingMatch = await Match.findOne({
      where: {
        date: date,
        homeTeamId: homeTeam,
        awayTeamId: awayTeam
      }
    })
    if (existingMatch) {
      return res.status(400).json({ error: 'Un match similaire existe déjà pour cette date et ces équipes' });
    }
    const match = await Match.create({
      ...req.body,
      homeTeamId: homeTeam,
      awayTeamId: awayTeam
    });
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de créer le match', message: error, datas: req.body });
  }
})
router.post('/bet/add', authenticateJWT, async (req, res) => {
  try {
    const date = req.body.date
    const userId = req.body.userId
    const matchId = req.body.matchId
    const existingBet = await Bets.findOne({
      where: {
        userId: userId,
        matchId: matchId
      }
    })
    if (existingBet) {
      return res.status(401).json({ error: 'Un prono existe déjà pour ce match et cet utilisateur' });
    }
    if (req.body.winnerId === null) {
      if (req.body.homeScore !== req.body.awayScore) {
        return res.status(401).json({ error: 'Le score n\'est pas valide, un match null doit avoir un score similaire pour les deux équipes' });
      }
    } else {
      if (req.body.homeScore === req.body.awayScore) {
        return res.status(401).json({ error: 'Le score n\'est pas valide, un match non null ne peux pas avoir un score similaire pour les deux équipes' });
      }
    }
    const bet = await Bets.create(req.body)
    res.status(200).json(bet);
  } catch (error) {
    res.status(400).json({ error: 'Impossible d\'enregistrer le pari', message: error, datas: req.body });
  }
})
router.post('/bets/user/:id', authenticateJWT, async (req, res) => {
  const matchIds = req.body.matchIds;

  try {
    const bets = await Bets.findAll({
      where: {
        userId: req.params.id,
        matchId: {
          [Op.in]: matchIds
        }
      },
    });
    res.json({
      data: bets,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})

// Define DELETE routes
router.delete('/admin/teams/delete/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const teamId = req.params.id;
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Équipe non trouvée' });

    await team.destroy();
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
});
router.delete('/admin/matchs/delete/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const matchId = req.params.id;
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Équipe non trouvée' });

    await match.destroy();
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
});
router.delete('/admin/bets/delete/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const betId = req.params.id;
    const bet = await Match.findByPk(betId);
    if (!bet) return res.status(404).json({ error: 'Équipe non trouvée' });

    await bet.destroy();
    res.status(200).json({ message: 'Équipe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l’équipe', message: error.message });
  }
})
router.delete('/admin/user/delete/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });

    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvée' });

    await user.destroy();
    res.status(200).json({ message: 'Utilisateur supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur', message: error.message });
  }
})

// Define PUT routes
router.put('/admin/user/update/:id', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { username, email, password } = req.body
    if (username) user.username = username
    if (email) user.email = email
    if (password) user.password = await bcrypt.hash(password, 10)
    if (req.file) {
      const imagePath = req.file.path;
      const baseName = path.basename(imagePath, path.extname(imagePath));
      // Créer des variations redimensionnées
      await sharp(imagePath)
        .resize(120, 120)
        .toFile(`${path.dirname(imagePath)}/${baseName}_120x120${path.extname(imagePath)}`);

      await sharp(imagePath)
        .resize(450, 450)
        .toFile(`${path.dirname(imagePath)}/${baseName}_450x450${path.extname(imagePath)}`);

      await sharp(imagePath)
        .resize(450)
        .toFile(`${path.dirname(imagePath)}/${baseName}_450xAuto${path.extname(imagePath)}`);

      const relativePath = req.file.path.split('client')[1]
      user.img = relativePath
    }

    await user.save()
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour l\'utilisateur' + error, });
  }
});
router.put('/admin/setting/update/:id', authenticateJWT, async (req, res) => {
  try {
    const setting = await Settings.findByPk(req.params.id);
    if (!setting) return res.status(404).json({ error: 'Réglage non trouvé' });

    const type = setting.type;
    if (type === 'select') {
      setting.activeOption = req.body.newValue;
    } else if (type === 'text') {
      const newOptions = { ...setting.options }
      newOptions['Value'] = req.body.newValue
      setting.options = newOptions
    }
    await setting.save();
    res.status(200).json(setting);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour le réglage' + error });
  }
});


module.exports = router;