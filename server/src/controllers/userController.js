const express = require('express')
const router = express.Router()
const axios = require("axios");
const logger = require("../utils/logger/logger");
const {authenticateJWT} = require("../middlewares/auth");
const { User, Team, Role, Bet, Match, Player} = require("../models");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const { downloadImage } = require('../services/imageService');
const bcrypt = require("bcrypt");
const path = require("path");
const sharp = require("sharp");
const multer = require("multer");
const { upload } = require('../utils/utils');
const moment = require("moment-timezone");
const {Op} = require("sequelize");
const {getCurrentSeasonId} = require("../services/seasonService");
const {getMonthPoints, getSeasonPoints, getWeekPoints} = require("../services/betService");
const {getCurrentMatchday} = require("../services/appService");

router.get('/admin/users/requests', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const users = await User.findAll({ where: { status: 'pending' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
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
      include: [
        {
          model: Role,
          as: 'Roles'
        },
        {
          model: Team,
          as: 'team',
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
router.put('/user/update/:id', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { username, email, password, roleName, teamId } = req.body
    if (username) user.username = username
    if (email) user.email = email
    if (password) user.password = await bcrypt.hash(password, 10)
    if (teamId) user.teamId = teamId
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
router.get('/user/:id/bets/last', authenticateJWT, async (req, res) => {
  try {
    const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 }); // Simulated date
    const startOfWeek = now.clone().startOf('isoWeek');
    const endOfWeek = now.clone().endOf('isoWeek');

    const startDate = startOfWeek.toDate();
    const endDate = endOfWeek.toDate();

    const bets = await Bet.findAll({
      include: [
        {
          model: Match,
          as: 'MatchId',
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
        },
        {
          model: Player,
          as: 'PlayerGoal'
        }
      ],
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
router.get('/user/:id/bets/:filter', authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.id;
    const filter = req.params.filter;

    if (filter === 'week') {
      const seasonId = await getCurrentSeasonId(61);
      const weekPoints = await getWeekPoints(seasonId, userId);
      console.log(`Week points for user ${userId}:`, weekPoints);
      return res.json({ points: weekPoints });
    } else if (filter === 'month') {
      const seasonId = await getCurrentSeasonId(61);
      const monthPoints = await getMonthPoints(seasonId, userId);
      console.log(`Month points for user ${userId}:`, monthPoints);
      return res.json({ points: monthPoints });
    } else if (filter === 'season') {
      const seasonId = await getCurrentSeasonId(61);
      const seasonPoints = await getSeasonPoints(seasonId, userId);
      console.log("typeof seasonPoints" + typeof seasonPoints);
      console.log(`Season points for user ${userId}:`, seasonPoints);
      return res.json({ points: seasonPoints });
    } else {
      return res.status(400).json({ error: 'Filtre non valide' });
    }
  } catch (error) {
    console.error('Impossible de récupérer les pronostics:', error);
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error });
  }
});
router.post('/user/verify-password', authenticateJWT, async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });

    res.status(200).json({ message: 'Mot de passe actuel correct' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe' });
  }
});

router.get('/user/:id/rewards', authenticateJWT, async (req, res) => {
  try {
    const rewards = await getRewards(req.params.id);
    res.status(200).json({ rewards });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
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

module.exports = router