const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const {Bet, Match, Team} = require("../models");
const {Op} = require("sequelize");
const {getNullBets, checkupBets} = require("../services/betService");

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
router.get('/bets/get-null/all', authenticateJWT, async (req, res) => {
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


module.exports = router