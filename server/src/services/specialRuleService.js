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
const {getCurrentMatchday} = require("./matchService");

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
    const currentMatchday = await getCurrentMatchday();
    if (!currentMatchday) throw new Error('Current matchday not found');

    return await SpecialRule.findOne({
      where: {
        status: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.cast(Sequelize.json('config.matchday'), 'int'),
            currentMatchday
          )
        ]
      },
      order: [['activation_date', 'ASC']]
    });
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

module.exports = {
  toggleSpecialRule,
  getCurrentSpecialRule,
  configSpecialRule
}