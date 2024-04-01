const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const {Op} = require("sequelize");
const {Season} = require("../models");
const schedule = require('node-schedule');
const {checkSeasonRewards} = require("./rewardService");

const getCurrentMatchday = async function () {
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


module.exports = {
  getCurrentMatchday,
  checkAndScheduleSeasonEndTasks,
}