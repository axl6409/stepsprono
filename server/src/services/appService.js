const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const {Op} = require("sequelize");
const {Season, Setting, Match} = require("../models");
const schedule = require('node-schedule');
const moment = require("moment/moment");
const eventBus = require("../events/eventBus");
const {getSeasonDates} = require("./seasonService");

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

const getStartAndEndOfCurrentWeek = () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return { startDate: startOfWeek, endDate: endOfWeek };
}

const getStartAndEndOfCurrentMonth = () => {
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  return { startOfMonth, endOfMonth };
};

const getFirstDaysOfCurrentAndPreviousMonth = () => {
  const currentMonth = new Date();
  const firstDayCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const firstDayPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

  return {
    firstDayCurrentMonth,
    firstDayPreviousMonth
  };
};

const getSeasonStartDate = async (seasonYear) => {
  const startDate = await Season.findOne({
    where: {
      year: seasonYear
    }
  })
  return startDate.start_date;
};

const getMidSeasonDate = async (seasonYear) => {
  const { startDate, endDate } = await getSeasonDates(seasonYear);

  const midSeasonTimestamp = startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2;
  return new Date(midSeasonTimestamp);
};

const getWeekDateRange = () => {
  const moment = require('moment');
  const now = moment()
  // const simNow = moment().set({ 'year': 2024, 'month': 7, 'date': 13 })
  const start = now.clone().startOf('isoWeek');
  const end = now.clone().endOf('isoWeek');
  return { start: start, end: end };
}

const getMonthDateRange = () => {
  const moment = require('moment');
  // const now = moment().set({ 'year': 2024, 'month': 7, 'date': 13 });
  const now = moment()
  const start = now.clone().startOf('month');
  const end = now.clone().endOf('month');
  return { start: start, end: end };
}

const getPeriodMatchdays = async (startDate, endDate) => {
  try {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime()) || !(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error("Dates invalides fournies à getPeriodMatchdays");
    }

    const matchdays = new Set();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      }
    })
    for (const match of matchs) {
      matchdays.add(match.matchday)
    }
    return Array.from(matchdays).map(Number);
  } catch (error) {
    console.log( 'Erreur lors de la récupération des matchs du mois courant:', error)
  }
}

const getCurrentWeekMatchdays = async () => {
  try {
    const matchdays = []
    const weekDates = getWeekDateRange();
    const matchs = await Match.findAll({
      where: {
        utc_date: {
          [Op.gte]: weekDates.start,
          [Op.lte]: weekDates.end
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
        logger.info(`Exécution de la tâche [SeasonEnded] pour la saison ${season.id}`);
        eventBus.emit('seasonEnded', season.id);
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
  try {
    return await Setting.findOne({where: {key: 'regulation'}})
  } catch (error) {
    logger.error('getSettlement ERROR: ', error)
  }
}

const scheduleTaskForEndOfMonthMatch = async () => {
  try {
    // Obtenez la première et la dernière date du mois en cours
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Récupérer toutes les journées sportives du mois
    const matchdays = await getPeriodMatchdays(firstDayOfMonth, lastDayOfMonth);

    if (matchdays.length === 0) {
      console.log("Aucune journée sportive pour ce mois.");
      return;
    }

    // Sélectionnez la dernière journée sportive
    const lastMatchday = Math.max(...matchdays);

    // Récupérez tous les matchs de la dernière journée
    const matches = await Match.findAll({
      where: {
        matchday: lastMatchday,
      },
      order: [['utc_date', 'ASC']], // Trie les matchs par date croissante
    });

    if (matches.length === 0) {
      console.log("Aucun match trouvé pour la dernière journée sportive.");
      return;
    }

    // Récupérer la date du premier et du dernier match
    const firstMatchDate = matches[0].utc_date;
    const lastMatchDate = matches[matches.length - 1].utc_date;

    // Vérifier si cette journée sportive se situe en fin de mois
    if (firstMatchDate.getMonth() === lastDayOfMonth.getMonth()) {
      console.log("La dernière journée sportive est en fin de mois.");

      // Planifier la tâche cron pour 2 heures après le dernier match
      const taskTime = new Date(lastMatchDate.getTime() + 2 * 60 * 60 * 1000);
      schedule.scheduleJob(taskTime, () => {
        eventBus.emit('monthEnded');
      });

      console.log(`Tâche planifiée pour le ${taskTime}.`);
    } else {
      console.log("La dernière journée sportive ne se situe pas en fin de mois.");
    }
  } catch (error) {
    console.error("Erreur lors de la planification de la tâche de fin de mois :", error);
  }
};

const getFirstMatchOfCurrentWeek = async () => {
  try {
    const currentDate = new Date();

    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    const firstMatch = await Match.findOne({
      where: {
        utc_date: {
          [Op.gte]: startOfWeek,
          [Op.lte]: endOfWeek,
        },
      },
      order: [['utc_date', 'ASC']],
    });

    return firstMatch ? firstMatch.utc_date : null;
  } catch (error) {
    console.error("Erreur lors de la récupération du premier match de la semaine en cours:", error);
    throw error;
  }
};

const scheduleBetsCloseEvent = async () => {
  try {
    const firstMatchDate = await getFirstMatchOfCurrentWeek();

    if (!firstMatchDate) {
      console.log("Aucun match trouvé pour cette semaine.");
      return;
    }

    const betsCloseTime = new Date(firstMatchDate);
    betsCloseTime.setHours(12, 0, 0, 0);

    schedule.scheduleJob(betsCloseTime, () => {
      console.log("Événement betsClose déclenché à 12h le jour du premier match.");
      eventBus.emit('betsClosed');
    });

    console.log(`Événement betsClose planifié pour le ${betsCloseTime}.`);
  } catch (error) {
    console.error("Erreur lors de la planification de l'événement betsClose:", error);
    throw error;
  }
};

module.exports = {
  getAPICallsCount,
  getWeekDateRange,
  getMonthDateRange,
  getPeriodMatchdays,
  getCurrentWeekMatchdays,
  getCurrentMonthMatchdays,
  getCurrentMatchday,
  checkAndScheduleSeasonEndTasks,
  getSettlement,
  scheduleTaskForEndOfMonthMatch,
  getStartAndEndOfCurrentWeek,
  getStartAndEndOfCurrentMonth,
  getFirstDaysOfCurrentAndPreviousMonth,
  getSeasonStartDate,
  getMidSeasonDate,
  getFirstMatchOfCurrentWeek,
  scheduleBetsCloseEvent
}