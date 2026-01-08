const { SpecialRule, SpecialRuleResult, User, Sequelize } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger/logger");
const { getCurrentSeasonId } = require("./logic/seasonLogic");
const { getCurrentCompetitionId } = require("./competitionService");

/**
 * Récupère l'item Mystery Box attribué à un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object|null} - Item attribué ou null
 */
const getUserMysteryBoxItem = async (userId) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return null;

    const selection = rule.config.selection;
    const userSelection = selection.find(s => s.user?.id === userId);

    if (!userSelection) return null;

    // Récupérer les données d'utilisation depuis SpecialRuleResult
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const result = await SpecialRuleResult.findOne({
      where: {
        rule_id: rule.id,
        season_id: seasonId
      }
    });

    let usageData = null;
    if (result?.results) {
      const userResult = result.results.find(r => r.user_id === userId);
      if (userResult) {
        usageData = userResult;
      }
    }

    return {
      item: userSelection.item,
      user: userSelection.user,
      usage: usageData
    };
  } catch (error) {
    logger.error('[getUserMysteryBoxItem] Error:', error);
    throw error;
  }
};

/**
 * Récupère toutes les attributions Mystery Box
 * @returns {Array} - Liste des attributions
 */
const getAllMysteryBoxSelections = async () => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return [];

    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const result = await SpecialRuleResult.findOne({
      where: {
        rule_id: rule.id,
        season_id: seasonId
      }
    });

    // Fusionner les sélections avec les données d'utilisation
    const selections = rule.config.selection.map(s => {
      let usageData = null;
      if (result?.results) {
        usageData = result.results.find(r => r.user_id === s.user?.id);
      }
      return {
        ...s,
        usage: usageData
      };
    });

    return selections;
  } catch (error) {
    logger.error('[getAllMysteryBoxSelections] Error:', error);
    throw error;
  }
};

/**
 * Enregistre ou met à jour l'utilisation d'un item Mystery Box
 * @param {number} userId - ID de l'utilisateur
 * @param {string} itemKey - Clé de l'item
 * @param {Object} data - Données spécifiques à l'action
 * @returns {Object} - Résultat de l'opération
 */
const useItem = async (userId, itemKey, data = {}) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule) {
      throw new Error('Mystery Box rule not found');
    }

    // Vérifier que l'utilisateur a bien cet item
    const selection = rule.config?.selection || [];
    const userSelection = selection.find(s => s.user?.id === userId && s.item?.key === itemKey);

    if (!userSelection) {
      throw new Error('User does not have this item');
    }

    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    // Récupérer ou créer le SpecialRuleResult
    let result = await SpecialRuleResult.findOne({
      where: {
        rule_id: rule.id,
        season_id: seasonId
      }
    });

    if (!result) {
      result = await SpecialRuleResult.create({
        rule_id: rule.id,
        season_id: seasonId,
        config: { matchday: rule.config?.matchday },
        results: []
      });
    }

    // Mettre à jour les résultats
    let results = result.results || [];
    const existingIndex = results.findIndex(r => r.user_id === userId);

    const usageEntry = {
      user_id: userId,
      item_key: itemKey,
      item_type: userSelection.item.type,
      used: true,
      used_at: new Date().toISOString(),
      data: data
    };

    if (existingIndex >= 0) {
      results[existingIndex] = usageEntry;
    } else {
      results.push(usageEntry);
    }

    await result.update({ results });

    logger.info(`[useItem] User ${userId} used item ${itemKey}`);

    return { success: true, message: 'Item utilisé avec succès', data: usageEntry };
  } catch (error) {
    logger.error('[useItem] Error:', error);
    throw error;
  }
};

/**
 * Vérifie si un item a été utilisé par un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} itemKey - Clé de l'item
 * @returns {Object|null} - Données d'utilisation ou null
 */
const getItemUsage = async (userId, itemKey) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule) return null;

    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const result = await SpecialRuleResult.findOne({
      where: {
        rule_id: rule.id,
        season_id: seasonId
      }
    });

    if (!result?.results) return null;

    const userResult = result.results.find(r => r.user_id === userId && r.item_key === itemKey);
    return userResult || null;
  } catch (error) {
    logger.error('[getItemUsage] Error:', error);
    throw error;
  }
};

/**
 * Récupère le compteur d'utilisation d'un item (pour vérifier max_count)
 * @param {string} itemKey - Clé de l'item
 * @returns {number} - Nombre d'attributions
 */
const getItemDistributionCount = async (itemKey) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return 0;

    const count = rule.config.selection.filter(s => s.item?.key === itemKey).length;
    return count;
  } catch (error) {
    logger.error('[getItemDistributionCount] Error:', error);
    throw error;
  }
};

/**
 * Récupère les items disponibles (non épuisés selon max_count)
 * @returns {Array} - Liste des items disponibles
 */
const getAvailableItems = async () => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.items) return [];

    const items = rule.config.items;
    const selection = rule.config.selection || [];

    const availableItems = items.filter(item => {
      const distributedCount = selection.filter(s => s.item?.key === item.key).length;
      return distributedCount < item.max_count;
    });

    return availableItems;
  } catch (error) {
    logger.error('[getAvailableItems] Error:', error);
    throw error;
  }
};

/**
 * Récupère les infos complètes de la Mystery Box (rule + items + selections)
 * @returns {Object} - Données complètes
 */
const getMysteryBoxData = async () => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule) return null;

    const availableItems = await getAvailableItems();
    const selections = await getAllMysteryBoxSelections();

    return {
      rule,
      items: rule.config?.items || [],
      availableItems,
      selections,
      matchday: rule.config?.matchday
    };
  } catch (error) {
    logger.error('[getMysteryBoxData] Error:', error);
    throw error;
  }
};

/**
 * Récupère le partenaire Communisme d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object|null} - Données du partenaire ou null
 */
const getCommunismePartner = async (userId) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return null;

    const selection = rule.config.selection;

    // Trouver si l'utilisateur a le malus communisme
    const userSelection = selection.find(s => s.user?.id === userId && s.item?.key === 'communisme');

    if (!userSelection || !userSelection.item?.data?.partner_id) return null;

    const partnerId = userSelection.item.data.partner_id;
    const partner = await User.findByPk(partnerId, {
      attributes: ['id', 'username', 'img']
    });

    return partner;
  } catch (error) {
    logger.error('[getCommunismePartner] Error:', error);
    throw error;
  }
};

/**
 * Récupère les informations Communisme complètes pour un utilisateur
 * Inclut le partenaire et le rôle (A ou B)
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object|null} - { isUserA, partnerId, partnerUsername }
 */
const getCommunismeInfo = async (userId) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return null;

    const selection = rule.config.selection;

    // Cas 1: L'utilisateur a le malus communisme directement (User A)
    const userSelection = selection.find(s => s.user?.id === userId && s.item?.key === 'communisme');

    if (userSelection && userSelection.item?.data?.partner_id) {
      const partnerId = userSelection.item.data.partner_id;
      const partner = await User.findByPk(partnerId, {
        attributes: ['id', 'username', 'img']
      });

      return {
        isActive: true,
        isUserA: true,
        partnerId: partnerId,
        partner: partner ? { id: partner.id, username: partner.username, img: partner.img } : null
      };
    }

    // Cas 2: L'utilisateur est le partenaire de quelqu'un qui a communisme (User B)
    const partnerSelection = selection.find(
      s => s.item?.key === 'communisme' && s.item?.data?.partner_id === userId
    );

    if (partnerSelection) {
      const partnerId = partnerSelection.user.id;
      const partner = await User.findByPk(partnerId, {
        attributes: ['id', 'username', 'img']
      });

      return {
        isActive: true,
        isUserA: false,
        partnerId: partnerId,
        partner: partner ? { id: partner.id, username: partner.username, img: partner.img } : null
      };
    }

    return null;
  } catch (error) {
    logger.error('[getCommunismeInfo] Error:', error);
    throw error;
  }
};

module.exports = {
  getUserMysteryBoxItem,
  getAllMysteryBoxSelections,
  useItem,
  getItemUsage,
  getItemDistributionCount,
  getAvailableItems,
  getMysteryBoxData,
  getCommunismePartner,
  getCommunismeInfo
};
