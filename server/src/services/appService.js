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

exports.getSettings = async () => {
  return await Setting.findAll();
};

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

exports.getRoles = async () => {
  return await Role.findAll();
};

exports.programMatchTasks = async () => {
  await fetchWeekMatches();
};

exports.getMatchCronTasks = async () => {
  return await getMatchsCronTasks();
};

exports.getCronTasks = async () => {
  return getCronTasks();
};

exports.getSettlement = async () => {
  return await Setting.findOne({ where: { key: 'regulation' } });
};

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
