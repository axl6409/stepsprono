const express = require('express')
const router = express.Router()
const axios = require("axios");
const logger = require("../utils/logger/logger");
const {authenticateJWT} = require("../middlewares/auth");
const { User, Team, Role, Bet, Match} = require("../models");
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
const {getMonthPoints, getSeasonPoints} = require("../services/betService");

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