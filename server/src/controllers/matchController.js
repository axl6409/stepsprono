const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const axios = require("axios");
const ProgressBar = require("progress");
const {Match, Bet, Team} = require("../models");
const moment = require("moment-timezone");
const {Op, Sequelize} = require("sequelize");
const cron = require("node-cron");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("../services/seasonService");
const {getMonthDateRange} = require("./appController");
const {checkupBets} = require("../services/betService");
const {schedule} = require("node-cron");
const {updateSingleMatch, updateMatchStatusAndPredictions, updateMatches} = require("../services/matchService");
const {getCurrentMatchday} = require("../services/appService");
const logger = require("../utils/logger/logger");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

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
        utc_date: {
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
    const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 });
    const startOfCurrentWeek = now.tz("Europe/Paris").startOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const endOfCurrentWeek = now.tz("Europe/Paris").endOf('isoWeek').format('YYYY-MM-DD HH:mm:ss');
    const matchs = await Match.findAndCountAll({
      where: {
        utc_date: {
          [Op.gte]: startOfCurrentWeek,
          [Op.lte]: endOfCurrentWeek
        },
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
router.get('/admin/matchs/no-results', authenticateJWT, async (req, res) => {
  try {
    const matchs = await Match.findAndCountAll({
      where: {
        status: "NS",
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
router.patch('/admin/matchs/update/results/:id', authenticateJWT, async (req, res) => {
  try {
    const matchId = req.params.id;
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès non autorisé', message: req.user });
    const match = await Match.findByPk(matchId);
    if (!match) return res.status(404).json({ error: 'Match non trouvé' });
    await updateMatchStatusAndPredictions(matchId)
    res.status(200).json({ message: 'Match mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.get('/admin/matchs/datas/to-update', authenticateJWT, async (req, res) => {
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
router.patch('/admin/matchs/datas/to-update/:id', authenticateJWT, async (req, res) => {
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

module.exports = router