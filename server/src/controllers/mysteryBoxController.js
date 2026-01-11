const express = require('express');
const router = express.Router();
const { authenticateJWT, checkAdmin, checkManagerTreasurer } = require("../middlewares/auth");
const logger = require("../utils/logger/logger");
const {
  getUserMysteryBoxItem,
  getAllMysteryBoxSelections,
  useItem,
  getItemUsage,
  getAvailableItems,
  getMysteryBoxData,
  getCommunismePartner,
  getCommunismeInfo,
  getBallePerduTargetInfo
} = require("../services/mysteryBoxService");
const { getBetByMatchAndUser } = require("../services/betService");
const { checkUserContribution, validateUserContribution } = require("../services/contributionService");

/**
 * GET /api/mystery-box/user/:userId
 * Récupère l'item Mystery Box attribué à un utilisateur
 */
router.get('/mystery-box/user/:userId', authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const item = await getUserMysteryBoxItem(userId);

    if (!item) {
      return res.status(204).json({ message: 'Aucun item attribué' });
    }

    res.json(item);
  } catch (error) {
    logger.error('[GET /mystery-box/user/:userId] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'item', error: error.message });
  }
});

/**
 * GET /api/mystery-box/selections
 * Récupère toutes les attributions Mystery Box (pour affichage public)
 */
router.get('/mystery-box/selections', authenticateJWT, async (req, res) => {
  try {
    const selections = await getAllMysteryBoxSelections();
    res.json(selections);
  } catch (error) {
    logger.error('[GET /mystery-box/selections] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des attributions', error: error.message });
  }
});

/**
 * GET /api/mystery-box/data
 * Récupère les données complètes de la Mystery Box
 */
router.get('/mystery-box/data', authenticateJWT, async (req, res) => {
  try {
    const data = await getMysteryBoxData();

    if (!data) {
      return res.status(404).json({ message: 'Mystery Box non trouvée' });
    }

    res.json(data);
  } catch (error) {
    logger.error('[GET /mystery-box/data] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données', error: error.message });
  }
});

/**
 * GET /api/mystery-box/available-items
 * Récupère les items encore disponibles (non épuisés selon max_count)
 */
router.get('/mystery-box/available-items', authenticateJWT, async (req, res) => {
  try {
    const items = await getAvailableItems();
    res.json(items);
  } catch (error) {
    logger.error('[GET /mystery-box/available-items] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des items', error: error.message });
  }
});

/**
 * GET /api/mystery-box/usage/:userId/:itemKey
 * Vérifie si un item a été utilisé par un utilisateur
 */
router.get('/mystery-box/usage/:userId/:itemKey', authenticateJWT, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const itemKey = req.params.itemKey;

    const usage = await getItemUsage(userId, itemKey);

    if (!usage) {
      return res.status(204).json({ message: 'Item non utilisé' });
    }

    res.json(usage);
  } catch (error) {
    logger.error('[GET /mystery-box/usage/:userId/:itemKey] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message });
  }
});

/**
 * GET /api/mystery-box/balle-perdue/target
 * Vérifie si l'utilisateur connecté est ciblé par une balle perdue
 */
router.get('/mystery-box/balle-perdue/target', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const targetInfo = await getBallePerduTargetInfo(userId);

    if (!targetInfo) {
      return res.status(204).json({ message: 'Pas de balle perdue reçue' });
    }

    res.json(targetInfo);
  } catch (error) {
    logger.error('[GET /mystery-box/balle-perdue/target] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message });
  }
});

/**
 * POST /api/mystery-box/use
 * Utilise un item Mystery Box
 * Body: { itemKey: string, data?: object }
 */
router.post('/mystery-box/use', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemKey, data } = req.body;

    if (!itemKey) {
      return res.status(400).json({ message: 'itemKey requis' });
    }

    const result = await useItem(userId, itemKey, data || {});
    res.json(result);
  } catch (error) {
    logger.error('[POST /mystery-box/use] Error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'utilisation de l\'item', error: error.message });
  }
});

/**
 * GET /api/mystery-box/communisme/partner
 * Récupère le partenaire Communisme de l'utilisateur connecté
 */
router.get('/mystery-box/communisme/partner', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const partner = await getCommunismePartner(userId);

    if (!partner) {
      return res.status(204).json({ message: 'Pas de partenaire Communisme' });
    }

    res.json(partner);
  } catch (error) {
    logger.error('[GET /mystery-box/communisme/partner] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du partenaire', error: error.message });
  }
});

/**
 * GET /api/mystery-box/communisme/info
 * Récupère les infos Communisme complètes (rôle A/B, partenaire)
 */
router.get('/mystery-box/communisme/info', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const info = await getCommunismeInfo(userId);

    if (!info) {
      return res.status(204).json({ message: 'Pas de Communisme actif' });
    }

    res.json(info);
  } catch (error) {
    logger.error('[GET /mystery-box/communisme/info] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des infos', error: error.message });
  }
});

/**
 * GET /api/mystery-box/communisme/partner-bet/:matchId
 * Récupère le pari du partenaire Communisme sur un match spécifique
 */
router.get('/mystery-box/communisme/partner-bet/:matchId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const matchId = parseInt(req.params.matchId, 10);

    // Récupérer les infos Communisme
    const info = await getCommunismeInfo(userId);
    if (!info || !info.partnerId) {
      return res.status(204).json({ message: 'Pas de partenaire Communisme' });
    }

    // Récupérer le pari du partenaire
    const partnerBet = await getBetByMatchAndUser(matchId, info.partnerId);

    if (!partnerBet) {
      return res.status(204).json({ message: 'Aucun pari du partenaire' });
    }

    // Récupérer le nom du buteur si présent
    let playerGoalName = null;
    if (partnerBet.player_goal) {
      const { Player } = require('../models');
      const player = await Player.findByPk(partnerBet.player_goal);
      if (player) {
        playerGoalName = player.name;
      }
    }

    // Retourner les infos essentielles du pari
    res.json({
      winner_id: partnerBet.winner_id,
      home_score: partnerBet.home_score,
      away_score: partnerBet.away_score,
      player_goal: partnerBet.player_goal,
      player_goal_name: playerGoalName,
      partner: info.partner
    });
  } catch (error) {
    logger.error('[GET /mystery-box/communisme/partner-bet/:matchId] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du pari', error: error.message });
  }
});

/**
 * GET /api/mystery-box/golden-ticket/contributions
 * Récupère les contributions en attente de l'utilisateur (pour golden ticket)
 */
router.get('/mystery-box/golden-ticket/contributions', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Vérifier que l'utilisateur a le bonus golden_ticket
    const userItem = await getUserMysteryBoxItem(userId);
    if (!userItem || userItem.item?.key !== 'golden_ticket') {
      return res.status(403).json({ message: 'Tu n\'as pas le Golden Ticket' });
    }

    if (userItem.usage?.used) {
      return res.status(400).json({ message: 'Tu as déjà utilisé ton Golden Ticket' });
    }

    const pendingContributions = await checkUserContribution(userId);
    res.json(pendingContributions || []);
  } catch (error) {
    logger.error('[GET /mystery-box/golden-ticket/contributions] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contributions', error: error.message });
  }
});

/**
 * POST /api/mystery-box/golden-ticket/use
 * Utilise le Golden Ticket pour annuler une contribution
 * Body: { contributionId: number }
 */
router.post('/mystery-box/golden-ticket/use', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contributionId } = req.body;

    if (!contributionId) {
      return res.status(400).json({ message: 'contributionId requis' });
    }

    // Vérifier que l'utilisateur a le bonus golden_ticket
    const userItem = await getUserMysteryBoxItem(userId);
    if (!userItem || userItem.item?.key !== 'golden_ticket') {
      return res.status(403).json({ message: 'Tu n\'as pas le Golden Ticket' });
    }

    if (userItem.usage?.used) {
      return res.status(400).json({ message: 'Tu as déjà utilisé ton Golden Ticket' });
    }

    // Valider la contribution (la marquer comme payée)
    const validationResult = await validateUserContribution(contributionId, userId);
    if (!validationResult.success) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Marquer le golden ticket comme utilisé
    const result = await useItem(userId, 'golden_ticket', { contribution_id: contributionId });

    logger.info(`[Golden Ticket] User ${userId} used golden ticket on contribution ${contributionId}`);
    res.json({ success: true, message: 'Golden Ticket utilisé ! Ta contribution a été annulée.' });
  } catch (error) {
    logger.error('[POST /mystery-box/golden-ticket/use] Error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'utilisation du Golden Ticket', error: error.message });
  }
});

/**
 * POST /api/mystery-box/steps-shop/select
 * Sélectionne un article du Steps Shop
 * Body: { selectedItem: string }
 */
router.post('/mystery-box/steps-shop/select', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { selectedItem, selectedItemName } = req.body;

    if (!selectedItem) {
      return res.status(400).json({ message: 'selectedItem requis' });
    }

    // Vérifier que l'utilisateur a bien le bonus steps_shop
    const userItem = await getUserMysteryBoxItem(userId);
    if (!userItem || userItem.item?.key !== 'steps_shop') {
      return res.status(403).json({ message: 'Tu n\'as pas le bonus Steps Shop' });
    }

    if (userItem.usage?.used) {
      return res.status(400).json({ message: 'Tu as déjà utilisé ton bonus Steps Shop' });
    }

    const result = await useItem(userId, 'steps_shop', { selected_item: selectedItem, selected_item_name: selectedItemName });
    res.json(result);
  } catch (error) {
    logger.error('[POST /mystery-box/steps-shop/select] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la sélection', error: error.message });
  }
});

// ============== ROUTES ADMIN ==============

/**
 * GET /api/admin/mystery-box/data
 * Récupère les données complètes pour l'admin
 */
router.get('/admin/mystery-box/data', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const data = await getMysteryBoxData();

    if (!data) {
      return res.status(404).json({ message: 'Mystery Box non trouvée' });
    }

    res.json(data);
  } catch (error) {
    logger.error('[GET /admin/mystery-box/data] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données', error: error.message });
  }
});

/**
 * GET /api/admin/mystery-box/selections
 * Récupère toutes les attributions avec détails d'utilisation (admin)
 */
router.get('/admin/mystery-box/selections', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const selections = await getAllMysteryBoxSelections();
    res.json(selections);
  } catch (error) {
    logger.error('[GET /admin/mystery-box/selections] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des attributions', error: error.message });
  }
});

/**
 * GET /api/admin/mystery-box/shop-selections
 * Récupère les sélections du Steps Shop (admin)
 */
router.get('/admin/mystery-box/shop-selections', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const selections = await getAllMysteryBoxSelections();

    // Filtrer uniquement les steps_shop avec leurs sélections
    const shopSelections = selections
      .filter(s => s.item?.key === 'steps_shop')
      .map(s => ({
        user: s.user,
        used: s.usage?.used || false,
        selectedItem: s.usage?.data?.selected_item || null,
        selectedItemName: s.usage?.data?.selected_item_name || null,
        usedAt: s.usage?.used_at || null
      }));

    res.json(shopSelections);
  } catch (error) {
    logger.error('[GET /admin/mystery-box/shop-selections] Error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sélections shop', error: error.message });
  }
});

module.exports = router;
