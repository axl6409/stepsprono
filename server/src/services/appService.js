const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const {Op} = require("sequelize");
const {Season, Setting, Match} = require("../models");
const schedule = require('node-schedule');
const {checkSeasonRewards} = require("./rewardService");
const moment = require("moment/moment");

const getAPICallsCount = async () => {
  try {
    const options = {
      method: 'GET',
      url: `${apiBaseUrl}status/`,
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
}

const getWeekDateRange = () => {
  const moment = require('moment');
  const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 }); // Simulated date
  const start = now.clone().startOf('isoWeek');
  const end = now.clone().endOf('isoWeek');
  return { start: start, end: end };
}

const getMonthDateRange = () => {
  const moment = require('moment');
  const now = moment().set({ 'year': 2024, 'month': 4, 'date': 13 }); // Simulated date
  const start = now.clone().startOf('month');
  const end = now.clone().endOf('month');
  return { start: start, end: end };
}

const getCurrentWeekMatchdays = async () => {
  try {
    const matchdays = []
    const monthDates = getWeekDateRange();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: monthDates.start,
          [Op.lte]: monthDates.end
        }
      }
    })
    for (const match of matchs) {
      matchdays.push(match.matchday)
    }
    return matchdays
  } catch (error) {
    console.log( 'Erreur lors de la récupération des matchs du mois courant:', error)
  }
}

const getCurrentMonthMatchdays = async () => {
  try {
    const matchdays = []
    const monthDates = getMonthDateRange();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: monthDates.start,
          [Op.lte]: monthDates.end
        }
      }
    })
    for (const match of matchs) {
      matchdays.push(match.matchday)
    }
    return matchdays
  } catch (error) {
    console.log( 'Erreur lors de la récupération des matchs du mois courant:', error)
  }
}

const getCurrentMatchday = async () => {
  try {
    const response = await Season.findAll({
      where: {
        current: true,
      }
    })
    return response[0].dataValues.currentMatchday
  } catch (error) {
    logger.error('getCurrentMatchday ERROR: ', error)
  }
}

const checkAndScheduleSeasonEndTasks = async () => {
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
        checkSeasonRewards()
        await Season.update(
          {
            taskScheduled: true
          },
          {
            where: { id: season.id }
          },
        );
      });
    });
  } catch (error) {
    logger.error("checkAndScheduleSeasonEndTasks ERROR :", error);
  }
};

const getSettlement = async () => {
  return await Setting.findOne({where: {key: 'regulation'}})
}

module.exports = {
  getAPICallsCount,
  getWeekDateRange,
  getMonthDateRange,
  getCurrentWeekMatchdays,
  getCurrentMonthMatchdays,
  getCurrentMatchday,
  checkAndScheduleSeasonEndTasks,
  getSettlement,
}