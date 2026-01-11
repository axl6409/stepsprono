const express = require('express')
const router = express.Router()
const {authenticateJWT, checkAdmin, checkManagerTreasurer} = require("../middlewares/auth");
const {Bet, Match, Team} = require("../models");
const {Op} = require("sequelize");
const {getNullBets, checkupBets, createBet, updateBet, updateAllBetsForCurrentSeason} = require("../services/betService");
const {getRanking, getDuoRanking} = require("../services/rankingService");
const {getSeasonRankingEvolution} = require("../services/rankingService");
const logger = require("../utils/logger/logger");
const {getCurrentSeasonYear, getCurrentSeasonId} = require("../services/logic/seasonLogic");
const {getCurrentMatchday} = require("../services/matchdayService");
const {getCommunismeInfo} = require("../services/mysteryBoxService");

/* PUBLIC - GET */
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
router.get('/bets/season-ranking', authenticateJWT, async (req, res) => {
  try {
    const seasonId = await getCurrentSeasonId(61);
    const ranking = await getRanking(seasonId, 'season');
    if (!ranking || ranking.length === 0) {
      return res.status(204).json({ message: 'Aucun classement trouvé pour cette saison.' });
    }
    res.status(200).json({ ranking });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du classement.', error: error.message });
  }
});
router.get('/bets/month-ranking', authenticateJWT, async (req, res) => {
  try {
    const seasonId = await getCurrentSeasonId(61);
    const month = req.query.month || null; // Format YYYY-MM
    const ranking = await getRanking(seasonId, 'month', null, month);
    if (!ranking || ranking.length === 0) {
      return res.status(204).json({ message: 'Aucun classement trouvé pour ce mois.' });
    }
    res.status(200).json({ ranking });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du classement.', error: error.message });
  }
});
router.get('/bets/week-ranking', authenticateJWT, async (req, res) => {
  try {
    const seasonId = await getCurrentSeasonId(61);
    const currentMatchday = await getCurrentMatchday();
    const ranking = await getRanking(seasonId, 'week', currentMatchday);
    if (!ranking || ranking.length === 0) {
      return res.status(204).json({ message: 'Aucun classement trouvé pour cette semaine.' });
    }
    res.status(200).json({ ranking });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du classement.', error: error.message });
  }
});
router.get('/bets/duo-ranking', authenticateJWT, async (req, res) => {
  try {
    const seasonId = await getCurrentSeasonId(61);
    const ranking = await getDuoRanking(seasonId);
    if (!ranking || !ranking.ranking || ranking.ranking.length === 0) {
      return res.status(200).json({
        ranking: {
          ranking: [],
          isDuoRanking: false,
          rules: [],
          message: ranking?.message || 'Aucun classement duo disponible.'
        }
      });
    }
    res.status(200).json({ ranking });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du classement duo.', error: error.message });
  }
});

/* PUBLIC - POST */
router.post('/bets/user/:id', authenticateJWT, async (req, res) => {
  const matchIds = req.body.matchIds;
  const userId = parseInt(req.params.id, 10);
  let seasonId = req.query.seasonId;
  if (!seasonId) {
    seasonId = await getCurrentSeasonId(61);
  }
  try {
    const bets = await Bet.findAll({
      where: {
        user_id: userId,
        match_id: {
          [Op.in]: matchIds
        },
        ...(seasonId && { season_id: seasonId }),
      },
    });

    // Vérifier si l'utilisateur a le communisme
    let communismeInfo = null;
    try {
      communismeInfo = await getCommunismeInfo(userId);
    } catch (e) {
      // Ignorer les erreurs de communisme
    }

    // Si communisme actif, récupérer les matchs bonus et vérifier les bets du partenaire
    if (communismeInfo?.isActive && communismeInfo?.partnerId) {
      // Récupérer les matchs pour identifier les bonus (require_details = true)
      const matches = await Match.findAll({
        where: {
          id: { [Op.in]: matchIds },
          require_details: true
        }
      });

      const bonusMatchIds = matches.map(m => m.id);
      const userBetMatchIds = bets.map(b => b.match_id);

      // Trouver les matchs bonus où l'utilisateur n'a pas encore de bet
      const missingBonusMatchIds = bonusMatchIds.filter(id => !userBetMatchIds.includes(id));

      if (missingBonusMatchIds.length > 0) {
        // Récupérer les bets du partenaire pour ces matchs
        const partnerBets = await Bet.findAll({
          where: {
            user_id: communismeInfo.partnerId,
            match_id: { [Op.in]: missingBonusMatchIds },
            ...(seasonId && { season_id: seasonId }),
          }
        });

        // Ajouter ces bets avec un flag pour pré-remplir le formulaire
        partnerBets.forEach(bet => {
          const betObj = bet.toJSON ? bet.toJSON() : bet;
          betObj.isPartnerBetPrefill = true;
          bets.push(betObj);
        });
      }
    }

    res.json({
      data: bets,
    });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.post('/bet/add', authenticateJWT, async (req, res) => {
  try {
    const bet = await createBet(req.body);
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

/* ADMIN - GET */
router.get('/admin/bets/unchecked', authenticateJWT, checkManagerTreasurer, async (req, res) => {
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

/* ADMIN - PATCH */
router.patch('/admin/bets/checkup/all', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const betIds = req.body;
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await checkupBets(betIds);
    if (bets.success === false) return res.status(403).json({ error: bets.error, message: bets.message });
    res.status(200).json({ message: bets.message, datas: bets.updatedBets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.patch('/admin/bets/update/all', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bets = await updateAllBetsForCurrentSeason();
    if (bets.success === false) return res.status(403).json({ error: bets.error, message: bets.message });
    res.status(200).json({ message: bets.message, datas: bets.updatedBets });
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message });
  }
})
router.patch('/admin/bets/checkup/:betId', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const betId = req.params.betId;
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Accès non autorisé', user: req.user });
    }
    const bet = await checkupBets(betId)
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

/* ADMIN - DELETE */
router.delete('/admin/bets/delete/:id', authenticateJWT, checkAdmin, async (req, res) => {
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

module.exports = router