const { SpecialRule, SpecialRuleResult, User, Sequelize } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger/logger");
const { getCurrentSeasonId } = require("./logic/seasonLogic");
const { getCurrentCompetitionId } = require("./competitionService");
const { getCurrentMatchday } = require("./matchdayService");

/**
 * Vérifie si la journée Mystery Box est actuellement active
 * @returns {Promise<boolean>} - true si la journée mystery box est la journée actuelle
 */
const isMysteryBoxMatchdayActive = async () => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.matchday) return false;

    const currentMatchday = await getCurrentMatchday();
    if (!currentMatchday) return false;

    const isActive = Number(rule.config.matchday) === Number(currentMatchday);
    logger.info(`[isMysteryBoxMatchdayActive] Mystery Box matchday: ${rule.config.matchday}, Current matchday: ${currentMatchday}, isActive: ${isActive}`);
    return isActive;
  } catch (error) {
    logger.error('[isMysteryBoxMatchdayActive] Error:', error);
    return false;
  }
};

/**
 * Vérifie si un match spécifique est sur la journée Mystery Box
 * @param {number} matchMatchday - La journée du match
 * @returns {Promise<boolean>} - true si le match est sur la journée mystery box
 */
const isMatchOnMysteryBoxMatchday = async (matchMatchday) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.matchday) return false;

    return Number(rule.config.matchday) === Number(matchMatchday);
  } catch (error) {
    logger.error('[isMatchOnMysteryBoxMatchday] Error:', error);
    return false;
  }
};

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
    const userSelection = selection.find(s => Number(s.user?.id) === Number(userId));

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
      const userResult = result.results.find(r => Number(r.user_id) === Number(userId));
      if (userResult) {
        usageData = userResult;
      }
    }

    return {
      item: userSelection.item,
      user: userSelection.user,
      usage: usageData,
      matchday: rule.config.matchday
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
        usageData = result.results.find(r => Number(r.user_id) === Number(s.user?.id));
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
    const userSelection = selection.find(s => Number(s.user?.id) === Number(userId) && s.item?.key === itemKey);

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
    const existingIndex = results.findIndex(r => Number(r.user_id) === Number(userId));

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

    // Forcer Sequelize à détecter le changement du champ JSON
    result.results = results;
    result.changed('results', true);
    await result.save();

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

    const userResult = result.results.find(r => Number(r.user_id) === Number(userId) && r.item_key === itemKey);
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
    // Vérifier si la journée mystery box est active
    const isMatchdayActive = await isMysteryBoxMatchdayActive();
    if (!isMatchdayActive) {
      return null;
    }

    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return null;

    const selection = rule.config.selection;

    // Trouver si l'utilisateur a le malus communisme
    const userSelection = selection.find(s => Number(s.user?.id) === Number(userId) && s.item?.key === 'communisme');

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
    // Vérifier si la journée mystery box est active
    const isMatchdayActive = await isMysteryBoxMatchdayActive();
    if (!isMatchdayActive) {
      return null;
    }

    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return null;

    const selection = rule.config.selection;

    // Chercher si l'utilisateur a l'item communisme (directement ou comme partenaire)
    const userSelection = selection.find(s => Number(s.user?.id) === Number(userId) && s.item?.key === 'communisme');

    if (userSelection && userSelection.item?.data?.partner_id) {
      const partnerId = userSelection.item.data.partner_id;
      const partner = await User.findByPk(partnerId, {
        attributes: ['id', 'username', 'img']
      });

      // Utiliser isPartner pour déterminer qui est User A (false) ou User B (true)
      const isUserA = !userSelection.item.isPartner;

      logger.info(`[getCommunismeInfo] User ${userId} has communisme, isPartner=${userSelection.item.isPartner}, isUserA=${isUserA}, partner: ${partnerId}`);
      return {
        isActive: true,
        isUserA: isUserA,
        partnerId: partnerId,
        partner: partner ? { id: partner.id, username: partner.username, img: partner.img } : null
      };
    }

    logger.info(`[getCommunismeInfo] User ${userId} is not involved in Communisme`);
    return null;
  } catch (error) {
    logger.error('[getCommunismeInfo] Error:', error);
    throw error;
  }
};

/**
 * Enregistre le choix du 2ème buteur pour le double_buteur
 * @param {number} userId - ID de l'utilisateur
 * @param {number} matchId - ID du match
 * @param {number} secondScorerId - ID du 2ème buteur
 * @returns {Object} - Résultat de l'opération
 */
const saveDoubleButeurChoice = async (userId, matchId, secondScorerId) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule) {
      throw new Error('Mystery Box rule not found');
    }

    // Vérifier que l'utilisateur a bien cet item
    const selection = rule.config?.selection || [];
    const userSelection = selection.find(s => Number(s.user?.id) === Number(userId) && s.item?.key === 'double_buteur');

    if (!userSelection) {
      throw new Error('User does not have double_buteur');
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
    let userResultIndex = results.findIndex(r => Number(r.user_id) === Number(userId) && r.item_key === 'double_buteur');

    if (userResultIndex >= 0) {
      // L'utilisateur a déjà des choix enregistrés
      let choices = results[userResultIndex].data?.choices || [];
      const matchChoiceIndex = choices.findIndex(c => c.match_id === matchId);

      if (matchChoiceIndex >= 0) {
        // Mettre à jour le choix existant pour ce match
        choices[matchChoiceIndex].second_scorer_id = secondScorerId;
      } else {
        // Ajouter un nouveau choix pour ce match
        choices.push({ match_id: matchId, second_scorer_id: secondScorerId });
      }

      results[userResultIndex].data = { choices };
      results[userResultIndex].used = true;
    } else {
      // Créer une nouvelle entrée pour cet utilisateur
      results.push({
        user_id: userId,
        item_key: 'double_buteur',
        item_type: userSelection.item.type,
        used: true,
        used_at: new Date().toISOString(),
        data: {
          choices: [{ match_id: matchId, second_scorer_id: secondScorerId }]
        }
      });
    }

    // Forcer Sequelize à détecter le changement du champ JSON
    result.results = results;
    result.changed('results', true);
    await result.save();

    logger.info(`[saveDoubleButeurChoice] User ${userId} saved 2nd scorer ${secondScorerId} for match ${matchId}`);

    return { success: true, message: '2ème buteur enregistré avec succès' };
  } catch (error) {
    logger.error('[saveDoubleButeurChoice] Error:', error);
    throw error;
  }
};

/**
 * Vérifie si un utilisateur est ciblé par une balle perdue
 * Note: balle_perdue est rétroactif, donc pas de vérification de la journée active
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object|null} - Données du tireur ou null
 */
const getBallePerduTargetInfo = async (userId) => {
  try {
    const rule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (!rule || !rule.config?.selection) return null;

    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const result = await SpecialRuleResult.findOne({
      where: {
        rule_id: rule.id,
        season_id: seasonId
      }
    });

    if (!result?.results) return null;

    // Chercher si cet utilisateur est la cible d'une balle_perdue
    for (const selection of rule.config.selection) {
      if (selection.item?.key === 'balle_perdue') {
        const usage = result.results.find(
          r => Number(r.user_id) === Number(selection.user?.id) && r.item_key === 'balle_perdue' && r.used
        );
        if (usage && Number(usage.data?.target_user_id) === Number(userId)) {
          // Cet utilisateur est la cible
          const shooter = await User.findByPk(selection.user.id, {
            attributes: ['id', 'username', 'img']
          });
          return {
            isTarget: true,
            shooter: shooter ? { id: shooter.id, username: shooter.username, img: shooter.img } : { id: selection.user.id, username: selection.user.username },
            penalty: -1
          };
        }
      }
    }

    return null;
  } catch (error) {
    logger.error('[getBallePerduTargetInfo] Error:', error);
    return null;
  }
};

/**
 * Récupère le 2ème buteur choisi pour un match
 * @param {number} userId - ID de l'utilisateur
 * @param {number} matchId - ID du match
 * @returns {number|null} - ID du 2ème buteur ou null
 */
const getDoubleButeurChoice = async (userId, matchId) => {
  const usage = await getItemUsage(userId, 'double_buteur');
  if (!usage?.data?.choices) return null;

  const matchChoice = usage.data.choices.find(c => c.match_id === matchId);
  return matchChoice?.second_scorer_id || null;
};

/**
 * Récupère l'auteur d'un prono pour le Communisme
 * @param {number} userId - ID de l'utilisateur
 * @param {number} matchId - ID du match
 * @returns {Object|null} - { authorId, partnerId } ou null
 */
const getCommunismeBetAuthor = async (userId, matchId) => {
  try {
    // Vérifier si la journée mystery box est active
    const isMatchdayActive = await isMysteryBoxMatchdayActive();
    if (!isMatchdayActive) {
      return null;
    }

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

    // Chercher qui a fait ce prono dans les résultats Communisme
    const communismeEntries = result.results.filter(r => r.item_key === 'communisme');

    for (const entry of communismeEntries) {
      if (Number(entry.user_id) === Number(userId) && entry.bets_made?.includes(matchId)) {
        // L'utilisateur actuel a créé ce prono
        return {
          authorId: userId,
          partnerId: entry.partner_id,
          isOwnBet: true
        };
      }
      if (Number(entry.partner_id) === Number(userId) && entry.bets_made?.includes(matchId)) {
        // Le partenaire a créé ce prono
        return {
          authorId: entry.user_id,
          partnerId: userId,
          isOwnBet: false
        };
      }
    }

    return null;
  } catch (error) {
    logger.error('[getCommunismeBetAuthor] Error:', error);
    return null;
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
  getCommunismeInfo,
  saveDoubleButeurChoice,
  getDoubleButeurChoice,
  getBallePerduTargetInfo,
  getCommunismeBetAuthor,
  isMysteryBoxMatchdayActive,
  isMatchOnMysteryBoxMatchday
};
