const axios = require("axios");
const ProgressBar = require("progress");
const {Match, Bet} = require("../models");
const moment = require("moment-timezone");
const {Op} = require("sequelize");
const cron = require("node-cron");
const {getCurrentSeasonId, getCurrentSeasonYear} = require("./seasonController");
const {getMonthDateRange} = require("./appController");
const {checkupBets} = require("./betController");
const {schedule} = require("node-cron");
const {updateSingleMatch} = require("../services/matchService");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
let cronTasks = [];


async function updateMatchStatusAndPredictions(matchIds) {
  if (!Array.isArray(matchIds)) {
    matchIds = [matchIds];
  }
  for (const matchId of matchIds) {
    await updateSingleMatch(matchId);
  }
}

async function getCurrentMonthMatchdays() {
  try {
    const matchdays = []
    const monthDates = getMonthDateRange();
    const matchs = await Match.findAll({
      where: {
        utcDate: {
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


function getMatchsCronTasks() {
  return cronTasks
}

module.exports = {
  updateMatchStatusAndPredictions,
  getMatchsCronTasks,
  getCurrentMonthMatchdays
};