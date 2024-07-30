const express = require('express')
const router = express.Router()
const {authenticateJWT} = require("../middlewares/auth");
const {Bet, Match, Team} = require("../models");
const {Op} = require("sequelize");
const {getNullBets, checkupBets, createBet, updateBet, checkBetByMatchId} = require("../services/betService");
const logger = require("../utils/logger/logger");

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
    const bet = await createBet(req.body);
    logger.info(req.body)
    res.status(200).json(bet);
  } catch (error) {
    if (error.message === 'Match non trouvé' || error.message === 'Un prono existe déjà pour ce match') {
      res.status(404).json({ error: error.message });
    } else if (error.message.startsWith('Le score n\'est pas valide')) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Impossible d\'enregistrer le prono', message: error.message });
    }
  }
})
router.post('/bets/user/:id', authenticateJWT, async (req, res) => {
  const matchIds = req.body.matchIds;

  try {
    const bets = await Bet.findAll({
      where: {
        user_id: req.params.id,
        match_id: {
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
router.get('/admin/bets/unchecked', authenticateJWT, async (req, res) => {
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
router.patch('/admin/bets/checkup/:betId', authenticateJWT, async (req, res) => {
  try {
    const betId = req.params.betId;
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bet = await checkBetByMatchId(betId)
    if (bet.success === false) return res.status(403).json({ error: bet.error, message: bet.message });
    res.status(200).json({ message: bet.message, datas: bet.updatedBets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.patch('/bet/update/:betId', authenticateJWT, async (req, res) => {
  try {
    const betId = req.params.betId;
    const bet = await updateBet({ id: betId, ...req.body });
    res.status(200).json(bet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})
module.exports = router