// server/src/services/appService.js
const axios = require('axios');
const { Setting, Role, Season } = require('../models');
const logger = require('../utils/logger/logger');
const { Op } = require('sequelize');
const schedule = require('node-schedule');
const { checkSeasonRewards } = require('./rewardService');
const { fetchWeekMatches, getMatchsCronTasks } = require('./matchService');
const moment = require('moment-timezone');
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/**
 * Retrieves the count of API calls made.
 *
 * @return {Promise} The data representing the count of API calls.
 */
exports.getAPICallsCount = async () => {
  try {
    const options = {
      method: 'GET',
      url: `${apiBaseUrl}/status/`,
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log('Erreur lors de la récupération des appels API : ', error);
  }
};

/**
 * Retrieves all settings.
 *
 * @return {Promise} All settings retrieved.
 */
exports.getSettings = async () => {
  return await Setting.findAll();
};

/**
 * Updates a setting based on the provided ID and new value.
 *
 * @param {number} id - The ID of the setting to update.
 * @param {string} newValue - The new value to set.
 * @return {Promise} The updated setting.
 */
exports.updateSetting = async (id, newValue) => {
  const setting = await Setting.findByPk(id);
  if (!setting) return null;

  const type = setting.type;
  if (type === 'select') {
    setting.activeOption = newValue;
  } else if (type === 'text') {
    const newOptions = { ...setting.options };
    newOptions['Value'] = newValue;
    setting.options = newOptions;
  }
  await setting.save();
  return setting;
};

/**
 * Retrieves all roles.
 *
 * @return {Promise} All roles retrieved.
 */
exports.getRoles = async () => {
  return await Role.findAll();
};

/**
 * Executes a program to match tasks asynchronously.
 *
 * @return {Promise} The result of the program execution.
 */
exports.programMatchTasks = async () => {
  await fetchWeekMatches();
};

/**
 * Retrieves match cron tasks asynchronously.
 *
 * @return {Promise} The result of retrieving match cron tasks.
 */
exports.getMatchCronTasks = async () => {
  return await getMatchsCronTasks();
};

/**
 * Retrieves all cron tasks.
 *
 * @return {Promise} The result of retrieving all cron tasks.
 */
exports.getCronTasks = async () => {
  return getCronTasks();
};

/**
 * Retrieves the settlement based on the regulation key.
 *
 * @return {Promise} The settlement retrieved.
 */
exports.getSettlement = async () => {
  return await Setting.findOne({ where: { key: 'regulation' } });
};

/**
 * Checks and schedules tasks at the end of a season.
 *
 * @return {Promise} The result of checking and scheduling season end tasks.
 */
exports.checkAndScheduleSeasonEndTasks = async () => {
  try {
    const today = new Date();
    const seasons = await Season.findAll({
      where: {
        endDate: {
          [Op.lte]: today,
        },
        taskScheduled: false,
      },
    });

    seasons.forEach(season => {
      schedule.scheduleJob(season.endDate, async () => {
        // Logique à exécuter à la fin de la saison
        logger.info(`Exécution de la tâche [SeasonEnded] pour la saison ${season.id}`);
        checkSeasonRewards();
        await Season.update(
          { taskScheduled: true },
          { where: { id: season.id } },
        );
      });
    });
  } catch (error) {
    logger.error('checkAndScheduleSeasonEndTasks ERROR:', error);
  }
};
