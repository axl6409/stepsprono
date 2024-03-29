const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { Op, Sequelize} = require('sequelize')
const jwt = require('jsonwebtoken')
const moment = require('moment-timezone')
moment.tz.setDefault("Europe/Paris");
const {User, Role, Team, TeamCompetition, Competition, Match, Bet, Setting, Player, PlayerTeamCompetition} = require("../models")
const axios = require('axios')
const multer = require("multer");
const path = require("path");
const {mkdirSync} = require("fs");
require('dotenv').config()
const secretKey = process.env.SECRET_KEY
const sharp = require('sharp')
const { getCronTasks } = require("../../cronJob");
const {updateMatchStatusAndPredictions, updateMatches, fetchWeekMatches, getMatchsCronTasks, getCurrentMatchday} = require("../controllers/matchController");
const {updatePlayers} = require("../controllers/playerController");
const {createOrUpdateTeams, updateTeamsRanking} = require("../controllers/teamController");
const {getCompetitionsByCountry} = require("../controllers/competitionController");
const {getAPICallsCount} = require("../controllers/appController");
const {getCurrentSeasonYear, getCurrentSeasonId} = require("../controllers/seasonController");
const {checkupBets, getNullBets, getMonthPoints, getSeasonPoints} = require("../controllers/betController");

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dest = path.join(__dirname, '../../../client/src/assets/uploads/users/', req.params.id);
    try {
      mkdirSync(dest, { recursive: true });
      console.log(`Dossier créé : ${dest}`);
      cb(null, dest);
    } catch (error) {
      console.error(`Erreur lors de la création du dossier : ${error}`);
    }
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
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    let queryOptions = {
      include: [{
        model: Role,
        through: { attributes: [] },
        where: {}
      }]
    };
    const roles = req.query.roles;
    console.log(roles);
    if (roles && roles.length > 0) {
      queryOptions.include[0].where.name = roles;
    }
    const users = await User.findAll(queryOptions);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/admin/users/requests', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const users = await User.findAll({ where: { status: 'pending' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
router.get('/admin/settings', authenticateJWT, async (req, res) => {
  try {
    // Vérifiez si l'utilisateur est admin ou manager
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/admin/roles', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Admin Routes => Dev Mode
router.get('/admin/matchs/to-update', authenticateJWT, async (req, res) => {
  try {
    const matchs = await Match.findAndCountAll({
      where: {
        scorers: null,
        status: "FT",
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
router.get('/admin/matchs/program-tasks', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    await fetchWeekMatches();
    res.status(200).json({ message: 'Programmation des matchs effectuée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la programmation des tâches', message: error.message });
  }
})
router.get('/admin/matchs/cron-tasks', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const cronTasks = await getMatchsCronTasks();
    res.status(200).json({ tasks: cronTasks });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la programmation des tâches', message: error.message });
  }
})
router.get('/app/api/calls', authenticateJWT, async (req, res) => {
  try {
    const calls = await getAPICallsCount();
    res.status(200).json({ calls });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.get('/app/bets/get-null/all', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await getNullBets();
    if (!bets) return res.status(404).json({ message: 'Aucun pronostic n\'est null' });
    res.status(200).json({ bets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})

router.get('/users/all', authenticateJWT, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/user/:id', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Role,
        as: 'Roles'
      }]
    });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
  }
})
router.get('/reglement', authenticateJWT, async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { key: 'regulation' } });
    if (!setting) {
      return res.status(404).json({ message: 'Règlement non trouvé' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
})
router.get('/competitions/by-country/:code', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const competitions = await getCompetitionsByCountry(req.params.matchId)
    res.status(200).json({ competitions: competitions })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des compétitions', message: error.message })
  }
})
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

    const teams = await TeamCompetition.findAndCountAll({
      include: [{
        model: Team,
        as: 'Team',
        required: true
      }],
      order: [
        [sortBy, 'ASC']
      ],
      offset,
      limit
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
})
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
})
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
})
router.get('/matchs/next-week', authenticateJWT, async (req, res) => {
  try {
    const startOfNextWeek = moment().tz("Europe/Paris").add(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfNextWeek = moment().tz("Europe/Paris").add(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');

    const matchs = await Match.findAndCountAll({
      where: {
        utcDate: {
          [Op.gte]: startOfNextWeek,
          [Op.lte]: endOfNextWeek
        },
        status: {
          [Op.not]: 'SCHEDULED'
        }
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ],
      order: [
        ['utcDate', 'ASC']
      ]
    });

    if (matchs.count === 0) {
      return res.status(404).json({ message: 'Aucun match trouvé pour la semaine prochaine' });
    }

    res.json({
      data: matchs.rows,
      totalCount: matchs.count,
      startOfNextWeek: startOfNextWeek,
      endOfNextWeek: endOfNextWeek
    });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error: error.message });
  }
})
router.get('/matchs/current-week', authenticateJWT, async (req, res) => {
  try {
    const startOfCurrentWeek = moment().tz("Europe/Paris").startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfCurrentWeek = moment().tz("Europe/Paris").endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const matchday = await getCurrentMatchday()
    const matchs = await Match.findAndCountAll({
      where: {
        matchday: {
          [Op.eq]: matchday
        },
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ],
      order: [
        ['utcDate', 'ASC']
      ]
    });

    if (matchs.count === 0) {
      return res.status(404).json({ message: 'Aucun match trouvé pour cette semaine' });
    }

    res.json({
      data: matchs.rows,
      totalCount: matchs.count,
      startOfNextWeek: startOfCurrentWeek,
      endOfNextWeek: endOfCurrentWeek
    });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error: error.message });
  }
})
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
    const bets = await Bet.findAndCountAll({
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
router.get('/players', authenticateJWT, async (req, res) => {
  try {
    const teamId1 = req.query.teamId1;
    const teamId2 = req.query.teamId2;
    let queryCondition;
    if (teamId1 && teamId2) {
      queryCondition = {
        teamId: [teamId1, teamId2]
      };
    } else if (teamId1 || teamId2) {
      queryCondition = {
        teamId: teamId1 || teamId2
      };
    } else {
      return res.status(400).send('Aucun identifiant d\'équipe fourni');
    }
    const players = await PlayerTeamCompetition.findAll({
      where: queryCondition,
      include: [
        { model: Player, as: 'Player' },
        { model: Team, as: 'Team' },
      ]
    });
    res.json(players);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs :', error);
    res.status(500).send('Erreur interne du serveur');
  }
})
router.get('/user/:id/bets/last', authenticateJWT, async (req, res) => {
  try {
    const startOfWeek = moment().startOf('isoWeek');
    const endOfWeek = moment().endOf('isoWeek');

    const startDate = startOfWeek.toDate();
    const endDate = endOfWeek.toDate();

    const bets = await Bet.findAll({
      include: [{
        model: Match,
        where: {
          utcDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      }],
      where: {
        userId: req.params.id
      }
    });

    if (bets.length === 0) {
      res.json({ message: 'Aucun pari pour la semaine en cours' })
    } else {
      res.json(bets)
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error })
  }
})
router.get('/user/:id/bets/month', authenticateJWT, async (req, res) => {
  try {
    const seasonId = await getCurrentSeasonId(61)
    const monthPoints = await getMonthPoints(seasonId, req.params.id);
    const startOfWeek = moment().startOf('month');
    const endOfWeek = moment().endOf('month');

    const startDate = startOfWeek.toDate();
    const endDate = endOfWeek.toDate();

    const bets = await Bet.findAll({
      include: [{
        model: Match,
        where: {
          utcDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      }],
      where: {
        userId: req.params.id
      }
    });

    if (bets.length === 0) {
      res.json({ message: 'Aucun pari pour le mois en cours', points: monthPoints })
    } else {
      res.json(monthPoints)
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error })
  }
})
router.get('/user/:id/bets/season', authenticateJWT, async (req, res) => {
  try {
    const seasonId = await getCurrentSeasonId(61)
    const bets = await getSeasonPoints(seasonId, req.params.id)
    if (bets.length === 0) {
      res.json({ message: 'Aucun pari pour la saison' })
    } else {
      res.json(bets)
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error })
  }
})
router.get('/app/cron-jobs/scheduled', authenticateJWT, async (req, res) => {
  try {
    const cronJobs = await getCronTasks();
    res.status(200).json({ cronJobs });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.get('/seasons/current/:competition', async (req, res) => {
  try {
    const competition = req.params.competition;
    const currentSeason = await getCurrentSeasonId(competition);
    res.status(200).json({ currentSeason });
  } catch (error) {
    res.status(500).json({ message: 'Current season can\'t be reached', error: error.message });
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
router.post('/bet/add', authenticateJWT, async (req, res) => {
  try {
    const { userId, matchId, winnerId, homeScore, awayScore } = req.body;
    const match = await Match.findOne({
      where: { id: matchId },
    });
    if (!match) {
      return res.status(404).json({ error: 'Match non trouvé' });
    }
    const existingBet = await Bet.findOne({
      where: {
        userId: userId,
        matchId: matchId
      }
    });
    if (existingBet) {
      return res.status(401).json({ error: 'Un prono existe déjà pour ce match et cet utilisateur' });
    }
    if (winnerId === null) {
      if (homeScore !== awayScore) {
        return res.status(401).json({error: 'Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes'});
      }
    } else {
      if ((winnerId === match.homeTeamId && parseInt(homeScore) <= parseInt(awayScore)) ||
        (winnerId === match.awayTeamId && parseInt(awayScore) <= parseInt(homeScore))) {
        return res.status(401).json({ error: 'Le score n\'est pas valide par rapport à l\'équipe gagnante sélectionnée' });
      }
    }
    const bet = await Bet.create(req.body);
    res.status(200).json(bet);
  } catch (error) {
    res.status(400).json({ error: 'Impossible d\'enregistrer le pari', message: error.message, datas: req.body });
  }
})
router.post('/bets/user/:id', authenticateJWT, async (req, res) => {
  const matchIds = req.body.matchIds;

  try {
    const bets = await Bet.findAll({
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
router.put('/user/update/:id', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { username, email, password, roleName } = req.body
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

      user.img = req.file.path.split('client')[1]
    }
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await user.setRoles([role])
        user.status = 'approved'
      }
    }

    await user.save()
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour l\'utilisateur' + error, });
  }
});
router.put('/admin/setting/update/:id', authenticateJWT, async (req, res) => {
  try {
    const setting = await Setting.findByPk(req.params.id);
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

// Define PATCH routes
router.patch('/user/:id/request-role', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({error: 'Utilisateur non trouvé' })

    const userStatus = user.status
    if (userStatus === 'pending') {
      res.status(403).json({ error: 'La demande est déjà en attente de validation'})
    }
    if (userStatus === 'refused') {
      res.status(401).json({ error: 'La demande à déjà été refusée'})
    }
    await user.update({ status: 'pending' })
    res.status(200).json({ message: 'La demande à été soumise avec succès' })
  } catch (error) {
    res.status(400).json({ error: 'Impossible de soumettre la requête ' + error })
  }
})
router.patch('/admin/matchs/to-update/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const matchId = req.params.id
    if (isNaN(matchId)) {
      return res.status(400).json({ message: 'Identifiant de match non valide' });
    }
    const match = await Match.findByPk(matchId)
    if (!match) return res.status(404).json({error: 'Match non trouvé' })
    await updateMatchStatusAndPredictions(match.id)
    res.status(200).json({ message: 'Match mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/matchs/update-all', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await updateMatches()
    res.status(200).json({ message: 'Matchs mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-ranking/all', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await updateTeamsRanking()
    res.status(200).json({ message: 'Équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-datas/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    await createOrUpdateTeams()
    res.status(200).json({ message: 'Données des équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-datas/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    const season = await getCurrentSeasonYear(61)
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await createOrUpdateTeams(team.id, season, 61, false, true)
    res.status(200).json({ message: 'Données des équipes mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-ranking/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await updateTeamsRanking(team.id, 61)
    res.status(200).json({ message: 'Équipe mise à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/teams/update-players/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const teamId = req.params.id
    if (isNaN(teamId)) {
      return res.status(400).json({ message: 'Identifiant d\'équipe non valide' });
    }
    const team = await Team.findByPk(teamId)
    if (!team) return res.status(404).json({error: 'Équipe non trouvé' })
    await updatePlayers(team.id, 61)
    res.status(200).json({ message: 'Joueurs mis à jour avec succès pour l\'equipe' + team.name });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/bets/checkup/all', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await checkupBets()
    if (bets.success === false) return res.status(403).json({ error: bets.error, message: bets.message });
    res.status(200).json({ message: bets.message, datas: bets.updatedBets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})

module.exports = router;