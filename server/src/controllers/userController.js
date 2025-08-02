const express = require('express')
const router = express.Router()
const {authenticateJWT, checkAdmin, checkManager} = require("../middlewares/auth");
const fs = require('fs');
const { mkdirSync, readdirSync } = require('fs');
const { promisify } = require('util');
const moveFile = promisify(fs.rename);
const { User, Team, Role, Bet, Match, Player, UserSeason} = require("../models");
const bcrypt = require("bcrypt");
const path = require("path");
const sharp = require("sharp");
const { upload, deleteFilesInDirectory} = require('../utils/utils');
const moment = require("moment-timezone");
const {Op} = require("sequelize");
const {getCurrentSeasonId} = require("../services/seasonService");
const {getMonthPoints, getSeasonPoints, getWeekPoints, getLastMatchdayPoints, getLastBetsByUserId, getAllLastBets,
  getMatchdayRanking
} = require("../services/betService");
const {updateLastConnect, getUserStats} = require("../services/userService");
const {getSeasonRankingEvolution, getSeasonRanking} = require("../services/rankingService");
const {getCurrentCompetitionId} = require("../services/competitionService");

/* PUBLIC - GET */
router.get('/users/all', authenticateJWT, async (req, res) => {
  try {
    const users = await User.findAll(
      {
        include: [
          {
            model: Role,
            as: 'Roles'
          },
          {
            model: UserSeason,
            as: 'user_seasons',
          }]
      }
    );
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
router.get('/user/:id/bets/last', authenticateJWT, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ error: 'Veuillez renseigner l\'id de l\'utilisateur' });
    const bets = await getLastBetsByUserId(req.params.id);
    if (bets.length === 0) {
      res.status(200).json({ bets: bets, message: 'Aucun pronos pour la semaine en cours' })
    } else {
      res.json({bets: bets})
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error })
  }
})
router.get('/users/bets/last', authenticateJWT, async (req, res) => {
  try {
    const bets = await getAllLastBets(req.params.id);
    if (bets.length === 0) {
      res.status(200).json({ bets: bets, message: 'Aucun pronos pour la semaine en cours' })
    } else {
      res.json({bets: bets})
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error })
  }
})
router.get('/users/bets/ranking/:matchday', authenticateJWT, async (req, res) => {
  try {
    const { seasonId } = req.query;
    const ranking = await getMatchdayRanking(req.params.matchday, seasonId);
    if (ranking.length === 0) {
      res.status(200).json({ ranking: ranking, message: `Aucun classement pour la journée ${req.params.matchday}` })
    } else {
      res.json({ranking: ranking})
    }
  } catch (error) {
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error })
  }
})
router.get('/user/:id/bets/:filter', authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const filter = req.params.filter;

    if (filter === 'week') {
      const weekPoints = await getWeekPoints(userId);
      return res.json({ points: weekPoints });
    } else if (filter === 'month') {
      const monthPoints = await getMonthPoints(userId);
      return res.json({ points: monthPoints });
    } else if (filter === 'season') {
      const seasonPoints = await getSeasonPoints(userId);
      return res.json({ points: seasonPoints });
    } else {
      return res.status(400).json({ error: 'Filtre non valide' });
    }
  } catch (error) {
    console.error('Impossible de récupérer les pronostics:', error);
    res.status(400).json({ error: 'Impossible de récupérer les pronostics : ' + error });
  }
});
router.get('/user/:id/stats', authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const userStats = await getUserStats(userId);
    return res.json(userStats);
  } catch (error) {
    console.error('Impossible de récupérer les statistiques:', error);
    res.status(400).json({ error: 'Impossible de récupérer les statistiques : ' + error });
  }
})
router.get('/users/season-ranking', authenticateJWT, async (req, res) => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
    const rankings = await getSeasonRanking(seasonId);

    res.status(200).json({ rankings });
  } catch (error) {
    console.error("Erreur dans /users/season-ranking :", error);
    res.status(500).json({ error: "Impossible de récupérer le classement." });
  }
});
router.get('/user/:id/rankings/season', authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const data = await getSeasonRankingEvolution(seasonId, userId);
    return res.json(data);

  } catch (error) {
    console.error("Erreur lors de la récupération du classement évolutif:", error);
    res.status(500).json({ error: "Impossible de récupérer les données de classement" });
  }
});


/* PUBLIC - PUT */
router.put('/user/update/:id', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { username, email, password, roleName, team_id } = req.body;
    if (team_id) user.team_id = team_id;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      const imagePath = req.file.path;
      const baseName = path.basename(imagePath, path.extname(imagePath));
      const userDirectory = path.dirname(imagePath);
      const tempDirectory = path.join(userDirectory, '..', 'temp');

      mkdirSync(tempDirectory, { recursive: true });

      await sharp(imagePath)
        .resize(120, 120)
        .toFile(`${tempDirectory}/${baseName}_120x120${path.extname(imagePath)}`);

      await sharp(imagePath)
        .resize(450, 450)
        .toFile(`${tempDirectory}/${baseName}_450x450${path.extname(imagePath)}`);

      await sharp(imagePath)
        .resize(450)
        .toFile(`${tempDirectory}/${baseName}_450xAuto${path.extname(imagePath)}`);

      const originalFileName = `${baseName}${path.extname(imagePath)}`;
      const originalFilePath = path.join(tempDirectory, originalFileName);
      await moveFile(imagePath, originalFilePath);

      deleteFilesInDirectory(userDirectory);

      const tempFiles = readdirSync(tempDirectory);
      for (const file of tempFiles) {
        await moveFile(path.join(tempDirectory, file), path.join(userDirectory, file));
      }

      fs.rmSync(tempDirectory, { recursive: true, force: true });

      user.img = path.basename(req.file.path);
    }
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await user.setRoles([role]);
        user.status = 'approved';
      }
    }
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: "Impossible de mettre à jour l'utilisateur" + error });
  }
});

/* PUBLIC - PATCH */
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
/* PUBLIC - PATCH */
router.patch('/user/:id/last-connect', authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const update = await updateLastConnect(userId);
    if (!update) return res.status(500).json({ error: 'Erreur lors de la mise à jour de la date et heure de dernière connexion' });
    res.status(200).json({ message: 'Date de dernière connexion mise à jour', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la date de dernière connexion' });
  }
});
router.patch('/user/:id/accepted', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    await user.update({ status: 'approved' });
    res.status(200).json({ message: 'Utilisateur approuvé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'approuvage de l\'utilisateur' });
  }
});
router.patch('/user/:id/blocked', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    await user.update({ status: 'blocked' });
    res.status(200).json({ message: 'Utilisateur bloqué avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du blocage de l\'utilisateur' });
  }
})

/* PUBLIC - POST */
router.post('/user/check-password', authenticateJWT, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ samePassword: true, error: 'Le nouveau mot de passe ne peut pas être le même que l\'ancien' });
    }

    res.status(200).json({ samePassword: false, message: 'Le nouveau mot de passe est différent de l\'ancien' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe' });
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

/* ADMIN - GET */
router.get('/admin/users/requests', authenticateJWT, checkManager, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    const users = await User.findAll({ where: { status: 'pending' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
router.get('/admin/users', authenticateJWT, checkManager, async (req, res) => {
  try {
    let queryOptions = {
      include: [{
        model: Role,
        through: { attributes: [] },
        where: {}
      }]
    };
    const roles = req.query.roles;
    if (roles && roles.length > 0) {
      queryOptions.include[0].where.name = roles;
    }
    const users = await User.findAll(queryOptions);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ADMIN - DELETE */
router.delete('/admin/user/delete/:id', authenticateJWT, checkManager, async (req, res) => {
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