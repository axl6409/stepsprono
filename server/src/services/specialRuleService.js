const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {SpecialRule} = require("../models");
const {Op, Sequelize} = require("sequelize");
const { sequelize } = require('../models');
const {schedule, scheduleJob} = require("node-schedule");
const moment = require("moment");
const logger = require("../utils/logger/logger");
const eventBus = require("../events/eventBus");
const { getCurrentMatchday } = require("./matchdayService");
const {getCurrentMatchdayRanking} = require("./logic/rankLogic");
const {status} = require("express/lib/response");

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
      console.log(payload.config.selected_user.id);
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

const checkSpecialRule = async (rule) => {
  const currentMatchday = await getCurrentMatchday();
  if (rule.config.matchday !== currentMatchday) return;

  if (rule.rule_key === 'hunt_day') {
    try {
      const ranking = await getCurrentMatchdayRanking();
      // Ici vous pouvez utiliser le ranking pour implémenter la logique de la règle spéciale
      // Par exemple :
      // - Trouver les utilisateurs avec le score le plus bas
      // - Appliquer des pénalités ou des bonus
      // - Déclencher des événements en fonction des positions

      logger.info(`[checkSpecialRule] Règle spéciale "${rule.rule_key}" traitée pour la journée ${currentMatchday}`);
      logger.debug(`[checkSpecialRule] Classement actuel:`, JSON.stringify(ranking, null, 2));

      // Exemple de logique à implémenter :
      // if (ranking.length > 0) {
      //   const minPoints = Math.min(...ranking.map(user => user.points));
      //   const lastPlaceUsers = ranking.filter(user => user.points === minPoints);
      //   // Faire quelque chose avec les utilisateurs en dernière position
      // }

    } catch (error) {
      logger.error(`[checkSpecialRule] Erreur lors du traitement de la règle spéciale:`, error);
    }
  }
}

module.exports = {
  toggleSpecialRule,
  getCurrentSpecialRule,
  configSpecialRule,
  checkSpecialRule
}