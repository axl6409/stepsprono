const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const {Op} = require("sequelize");
const { User, Role } = require("../models");
const schedule = require('node-schedule');
const bcrypt = require('bcrypt');
const {checkSeasonRewards} = require("./rewardService");

const addNewUser = async function () {
  try {

  } catch (error) {
    logger.error('addNewUser ERROR: ', error)
  }
}

const updateUser = async () => {
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