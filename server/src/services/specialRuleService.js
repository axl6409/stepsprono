const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {SpecialRule, SpecialRuleResult, Sequelize} = require("../models");
const {Op} = require("sequelize");
const { sequelize } = require('../models');
const {schedule, scheduleJob} = require("node-schedule");
const moment = require("moment");
const logger = require("../utils/logger/logger");
const eventBus = require("../events/eventBus");
const { getCurrentMatchday } = require("./matchdayService");
const {getCurrentMatchdayRanking} = require("./logic/rankLogic");
const {status} = require("express/lib/response");
const {getCurrentSeasonId} = require("./seasonService");
const {getRanking, getRawRanking} = require("./rankingService");

const toggleSpecialRule = async (id, active) => {
  try {
    const rule = await SpecialRule.findByPk(id);
    if (!rule) return;
    rule.status = active;
    await rule.save();
    logger.info(`[toggleSpecialRule] Special rule ${rule.id} toggled to ${active}`);
  } catch (error) {
    logger.error('[toggleSpecialRule] Error toggling special rule:', error);
  }
}

const getCurrentSpecialRule = async () => {
  try {
    const currentMatchday = parseInt(await getCurrentMatchday(), 10);
    if (!currentMatchday) throw new Error('Current matchday not found');

    const rule = await SpecialRule.findOne({
      where: {
        status: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.literal("(config->>'matchday')::int"),
            { [Op.eq]: currentMatchday }
          )
        ]
      }
    });

    if (!rule) return status(204).json({ message: 'Aucune règle active cette semaine' });
    return rule;
  } catch (error) {
    logger.error('[getCurrentSpecialRule] Error getting current special rule:', error);
  }
};

const getSpecialRuleByKey = async (rule_key) => {
  try {
    const rule = await SpecialRule.findOne({
      where: {
        rule_key: rule_key
      }
    })
    if (!rule) return status(204).json({ message: 'Aucune règle active cette semaine' });
    return rule;
  } catch (e) {
    logger.error('[getSpecialRuleByKey] Error getting special rule:', e);
    throw e;
  }
}

const configSpecialRule = async (ruleId, payload) => {
  try {
    const rule = await SpecialRule.findByPk(ruleId);
    if (!rule) throw new Error('Special rule not found');

    const currentConfig = rule.config || {};
    let newConfig = { ...currentConfig };

    if (payload.config?.matchday) {
      newConfig.matchday = payload.config.matchday;
    }

    logger.info('[configSpecialRule] payload =>', payload);

    if (payload.config?.selected_user) {
      newConfig.selected_user = payload.config.selected_user.id;
    } else if (payload.config?.user_pairs) {
      newConfig.user_pairs = {};
      for (const pair of payload.config.user_pairs) {
        newConfig.user_pairs[pair.id] = pair.id;
      }
    }

    rule.config = newConfig;

    await rule.save();
    return rule;
  } catch (error) {
    console.error('[configSpecialRule] Error updating rule:', error);
    throw error;
  }
};

const checkSpecialRule = async (rule_key) => {
  const rule = await getSpecialRuleByKey(rule_key);
  if (!rule) return;
  const currentMatchday = await getCurrentMatchday();
  if (rule.config.matchday !== currentMatchday) return;

  if (rule.rule_key === 'hunt_day') {
    try {
      return checkHuntDay(rule).then(message => message);
    } catch (error) {
      logger.error(`[checkSpecialRule] Erreur lors du traitement de la règle spéciale:`, error);
    }
  }
}

const checkHuntDay = async (rule) => {
  const seasonId = await getCurrentSeasonId(61);
  const ranking = await getRawRanking(seasonId, 'week');

  if (!Array.isArray(ranking) || ranking.length === 0) {
    return "Aucun classement disponible pour l'instant.";
  }

  const cfg = rule?.config || {};
  const targetUserId = Number(cfg.selected_user);

  if (!Number.isFinite(targetUserId)) {
    logger.warn(`[HUNT DAY] selected_user invalide: ${cfg.selected_user}`);
    return `Utilisateur cible invalide (${cfg.selected_user}).`;
  }

  const targetUser = ranking.find(r => Number(r.user_id) === targetUserId);
  if (!targetUser) {
    return `Utilisateur cible (${targetUserId}) non trouvé dans le classement.`;
  }

  const targetPoints = Number(targetUser.points) || 0;
  const bonus = Number.isFinite(cfg.points_bonus) ? cfg.points_bonus : 1;
  const malus = Number.isFinite(cfg.points_malus) ? cfg.points_malus : -1;

  const results = ranking.map(user => {
    const uid = Number(user.user_id);
    const upoints = Number(user.points) || 0;

    if (uid === targetUserId) {
      return { ...user, hunt_result: 0 };
    }

    let hunt_result = 0;
    if (upoints > targetPoints) hunt_result = bonus;
    else if (upoints < targetPoints) hunt_result = malus;

    return { ...user, hunt_result };
  });

  const configResult = {
    matchday: cfg.matchday,
    ranking_effect: true
  };

  const existing = await SpecialRuleResult.findOne({
    where: {
      rule_id: rule.id,
      season_id: seasonId
    }
  });

  if (existing) {
    await existing.update({
      config: configResult,
      results
    });
    logger.info(`[HUNT DAY] Résultats mis à jour pour la règle ${rule.id} (saison ${seasonId})`);
  } else {
    await SpecialRuleResult.create({
      rule_id: rule.id,
      season_id: seasonId,
      config: configResult,
      results,
    });
    logger.info(`[HUNT DAY] Résultats enregistrés pour la règle ${rule.id} (saison ${seasonId})`);
  }

  return results;
};

module.exports = {
  toggleSpecialRule,
  getCurrentSpecialRule,
  configSpecialRule,
  checkSpecialRule,
}