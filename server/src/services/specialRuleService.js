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
    const today = new Date();

    return await SpecialRule.findOne({
      where: {
        status: true,
        activation_date: {
          [Op.gte]: today
        }
      },
      order: [['activation_date', 'ASC']]
    });
  } catch (error) {
    logger.error('[getCurrentSpecialRule] Error getting current special rule:', error);
  }
};

module.exports = {
  toggleSpecialRule,
  getCurrentSpecialRule
}