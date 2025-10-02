const express = require('express')
const router = express.Router()
const {authenticateJWT, checkAdmin, checkManager, checkManagerTreasurer} = require("../middlewares/auth");
const {Match, Team} = require("../models");
const {Op, Sequelize} = require("sequelize");
const {getCurrentSeasonId} = require("../services/logic/seasonLogic");
const {updateMatchAndPredictions, updateMatches, updateRequireDetails, fetchMatchsNoChecked, getMatchAndBets,
  getAvailableMonthsWithMatches, getPastAndCurrentMatchdays, updateExistingMatchDates
} = require("../services/matchService");
const {getCurrentMatchday} = require("../services/matchdayService")
const logger = require("../utils/logger/logger");
const {match} = require("sinon");
const {getCurrentMoment} = require("../services/logic/dateLogic");

/* PUBLIC - GET */
router.get('/match/:matchId', authenticateJWT, async (req, res) => {
  try {
    const match = await getMatchAndBets(req.params.matchId);
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du match et des pronostics', error: error.message })
  }
})
router.get('/matchs/current-matchday', authenticateJWT, async (req, res) => {
  try {
    const matchday = await getCurrentMatchday();
    res.json(matchday);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la journée sportive actuelle', error: error.message })
  }
})
router.get('/matchs/day/:matchday', authenticateJWT, async (req, res) => {
  try {
    let matchday = parseInt(req.params.matchday) || 1;
    let seasonId = req.query.seasonId;
    if (!seasonId) {
      seasonId = await getCurrentSeasonId(61);
    }
    const matchs = await Match.findAndCountAll({
      where: {
        matchday: matchday,
        season_id: seasonId,
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
    let seasonId = req.query.seasonId;
    if (!seasonId) {
      seasonId = await getCurrentSeasonId(61);
    }
    const matchdays = await getPastAndCurrentMatchdays(seasonId);
    res.json(matchdays);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matchdays', error: error.message });
  }
})
router.get('/matchs/next-week', authenticateJWT, async (req, res) => {
  try {
    const now = getCurrentMoment();
    const startOfNextWeek = now.clone().add(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfNextWeek = now.clone().add(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');

    const matchs = await Match.findAndCountAll({
      where: {
        utc_date: {
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
        ['utc_date', 'ASC']
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
    const now = getCurrentMoment();
    const startOfCurrentWeek = now.clone().startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfCurrentWeek = now.clone().endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const matchs = await Match.findAndCountAll({
      where: {
        utc_date: { [Op.gte]: startOfCurrentWeek, [Op.lte]: endOfCurrentWeek },
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ],
      order: [['utc_date', 'ASC']]
    });
    const currentMatchday = await getCurrentMatchday();
    if (matchs.count === 0) {
      return res.status(200).json({ data: [], message: 'Aucun match trouvé pour cette semaine' });
    }

    res.json({
      data: matchs.rows,
      totalCount: matchs.count,
      startOfWeek: startOfCurrentWeek,
      endOfWeek: endOfCurrentWeek,
      currentMatchday
    });
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error: error.message });
  }
})
router.get('/matchs/months/available', authenticateJWT, async (req, res) => {
  try {
    const monthsWithMatches = await getAvailableMonthsWithMatches();
    res.status(200).json(monthsWithMatches);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des mois disponibles', error: error.message });
  }
});
router.get('/matchs/matchdays/all', authenticateJWT, async (req, res) => {
  try {
    let seasonId = req.query.season_id;
    if (!seasonId) {
      seasonId = await getCurrentSeasonId(61);
    }
    const matchdays = await Match.findAll({
      attributes: ['matchday'],
      group: ['matchday'],
      order: [['matchday', 'ASC']],
      where: {
        season_id: seasonId
      }
    });
    res.status(200).json(matchdays);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matchdays', error: error.message });
  }
})

/* ADMIN - GET */
router.get('/admin/matchs/no-results', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const matchs = await Match.findAndCountAll({
      where: {
        status: "FT",
        scorers: null
      },
      include: [
        { model: Team, as: 'HomeTeam' },
        { model: Team, as: 'AwayTeam' }
      ]
    })
    res.status(200).json({
      data: matchs.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.get('/admin/matchs/no-checked', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const matchs = await fetchMatchsNoChecked()
    res.status(200).json({
      data: matchs.data,
      count: matchs.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matchs', error: error.message });
  }
});
router.get('/admin/matchs/datas/to-update', authenticateJWT, checkManagerTreasurer, async (req, res) => {
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

/* ADMIN - PATCH */
router.patch('/admin/matchs/update/results/:id', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const matchId = req.params.id;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Match non trouvé' });
    await updateMatchAndPredictions(matchId)
    res.status(200).json({ message: 'Match mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.patch('/admin/matchs/update-all', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const { competitionId } = req.body;
    if (!competitionId) {
      return res.status(400).json({ message: 'Aucun identifiant de competition fourni' });
    }
    await updateMatches(competitionId)
    res.status(200).json({ message: 'Matchs mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/matchs/update-all/utc', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const { competitionId } = req.body;
    if (!competitionId) {
      return res.status(400).json({ message: 'Aucun identifiant de competition fourni' });
    }
    await updateExistingMatchDates(competitionId)
    res.status(200).json({ message: 'Matchs mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
});
router.patch('/admin/matchs/:id/require-details', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé' });

    const matchId = req.params.id;
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Match non trouvé' });

    match.require_details = req.body.require_details;
    await match.save();

    res.status(200).json({ message: 'Field updated successfully', match });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

/* ADMIN - POST */
router.post('/admin/matchs/update-require-details', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    await updateRequireDetails();
    res.status(200).json({ message: 'Mise à jour réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
});

/* ADMIN - DELETE */
router.delete('/admin/matchs/delete/:id', authenticateJWT, checkAdmin, async (req, res) => {
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

module.exports = router