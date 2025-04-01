const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const {Op} = require("sequelize");
const {Season, Setting, Match} = require("../models");
const schedule = require('node-schedule');
const moment = require("moment-timezone");
const eventBus = require("../events/eventBus");
const {getSeasonDates, getCurrentSeasonId} = require("./seasonService");
const {getCurrentCompetitionId} = require("./competitionService");

/**
 * Retrieves the number of API calls made by the server.
 *
 * @return {Promise<Object>} A promise that resolves to an object containing the number of API calls made by the server.
 * @throws {Error} If there is an error retrieving the API calls.
 */
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

const getAdjustedMoment = (date) => {
  const localTime = moment.tz(date, "Europe/Paris");
  const isDST = localTime.isDST();
  return isDST ? localTime.add(1, 'hours') : localTime;
};


/**
 * Returns the start and end dates of the current month.
 *
 * @return {Object} An object with `startOfMonth` and `endOfMonth` properties,
 * representing the start and end dates of the current month respectively.
 */
const getStartAndEndOfCurrentMonth = () => {
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  return { startOfMonth, endOfMonth };
};

/**
 * Returns an object containing the first day of the current month and the first day of the previous month.
 *
 * @return {Object} An object with `firstDayCurrentMonth` and `firstDayPreviousMonth` properties,
 * representing the first day of the current month and the first day of the previous month respectively.
 */
const getFirstDaysOfCurrentAndPreviousMonth = () => {
  const currentMonth = new Date();
  const firstDayCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const firstDayPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

  return {
    firstDayCurrentMonth,
    firstDayPreviousMonth
  };
};

/**
 * Retrieves the start date of a season.
 *
 * @param {number} seasonYear - The year of the season.
 * @return {Promise<Date>} A Promise that resolves to the start date of the season.
 */
const getSeasonStartDate = async (seasonYear) => {
  const startDate = await Season.findOne({
    where: {
      year: seasonYear
    }
  })
  return startDate.start_date;
};

/**
 * Retrieves the mid-season date for a given season year.
 *
 * @param {number} seasonYear - The year of the season.
 * @return {Promise<Date>} A Promise that resolves to the mid-season date.
 */
const getMidSeasonDate = async (seasonYear) => {
  const { startDate, endDate } = await getSeasonDates(seasonYear);

  const midSeasonTimestamp = startDate.getTime() + (endDate.getTime() - startDate.getTime()) / 2;
  return new Date(midSeasonTimestamp);
};

/**
 * Retrieves the start and end dates of the current ISO week.
 *
 * @return {Object} An object containing the start and end dates of the current ISO week.
 */
const getWeekDateRange = () => {
  const moment = require('moment');
  const now = moment().utc()
  // const simNow = moment().set({ 'year': 2024, 'month': 7, 'date': 13 })
  const start = now.clone().startOf('isoWeek');
  const end = now.clone().endOf('isoWeek');
  return { start: start.toDate(), end: end.toDate() };
}

/**
 * Returns the start and end dates of the current month.
 *
 * @return {Object} An object with `startOfMonth` and `endOfMonth` properties,
 * representing the start and end dates of the current month respectively.
 */
const getMonthDateRange = () => {
  const moment = require('moment');
  // const now = moment().set({ 'year': 2025, 'month': 0, 'date': 25 });
  const now = moment()
  const start = now.clone().startOf('month');
  const end = now.clone().endOf('month');
  return { start: start, end: end };
}

/**
 * Retrieves the matchdays within a given period of time.
 *
 * @param {Date} startDate - The start date of the period.
 * @param {Date} endDate - The end date of the period.
 * @return {Promise<number[]>} An array of matchdays within the given period.
 * @throws {Error} If the provided dates are invalid.
 */
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
        },
        status: 'FT'
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

const getMatchdayPeriod = async (matchday) => {
  try {
    if (isNaN(matchday)) {
      logger.error("Matchday invalide fourni à getMatchdayPeriod");
      throw new Error("Matchday invalide fourni à getMatchdayPeriod");
    }

    const matchs = await Match.findAll({
      where: {
        matchday: matchday,
      },
      order: [['utc_date', 'ASC']]
    });

    if (matchs.length === 0) {
      logger.info('Aucun match prévu pour le matchday', matchday);
      throw new Error(`Aucun match trouvé pour le matchday ${matchday}`);
    }

    const startDate = matchs[0].utc_date;
    const endDate = matchs[matchs.length - 1].utc_date;

    return {
      startDate,
      endDate
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des dates du matchday :', error);
    throw error;
  }
};

/**
 * Retrieves the matchdays within the current week.
 *
 * @return {Promise<number[]>} An array of matchdays within the current week.
 */
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

/**
 * Retrieves the matchdays within the current month.
 *
 * @return {Promise<number[]>} An array of matchdays within the current month.
 */
const getCurrentMonthMatchdays = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const { start, end } = getMonthDateRange();

    const matches = await Match.findAll({
      where: {
        competition_id: competitionId,
        season_id: seasonId,
        utc_date: {
          [Op.between]: [start, end]
        }
      },
      order: [['utc_date', 'ASC']]
    });

    if (matches.length > 0) {
      const uniqueMatchdays = Array.from(new Set(matches.map(match => match.matchday)));
      return uniqueMatchdays;
    } else {
      logger.info('Aucun match prévu ce mois-ci.');
      return [];
    }

  } catch (error) {
    logger.error('Erreur lors de la récupération des matchdays :', error);
    throw error;
  }
};

/**
 * Checks the database for seasons that have ended and have not yet had their end tasks scheduled,
 * and schedules a task to run when the season ends. When the task runs, it emits a 'seasonEnded'
 * event with the season ID and updates the season's taskScheduled flag to true.
 *
 * @return {Promise<void>} A Promise that resolves when all tasks have been scheduled or rejects
 *                         with an error if there was an issue retrieving the seasons or scheduling
 *                         the tasks.
 */
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

/**
 * Retrieves the settlement from the database based on the 'regulation' key.
 *
 * @return {Promise<Object>} The settlement object from the database.
 * @throws {Error} If there is an error retrieving the settlement from the database.
 */
const getSettlement = async () => {
  try {
    return await Setting.findOne({where: {key: 'regulation'}})
  } catch (error) {
    logger.error('getSettlement ERROR: ', error)
  }
}

const getRankingMode = async () => {
  try {
    const setting = await Setting.findOne({
      where: { key: 'rankingMode' },
    });
    return setting ? setting.active_option : null;
  } catch (error) {
    throw new Error("Erreur lors de la récupération du rankingMode: " + error.message);
  }
};

/**
 * Schedules a task to be executed at the end of the current month if the last matchday of the month
 * is also the last matchday of the month. The task emits the 'monthEnded' event.
 *
 * @return {Promise<void>} A promise that resolves when the task is scheduled or rejects with an error.
 */
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

/**
 * Retrieves the UTC date of the first match of the current week.
 *
 * @return {Promise<Date|null>} The UTC date of the first match of the current week, or null if no match is found.
 * @throws {Error} If there is an error retrieving the first match from the database.
 */
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

/**
 * Schedules the betsClose event for the first match of the current week.
 *
 * @return {Promise<void>} - A promise that resolves when the event is scheduled successfully,
 * or rejects with an error if there is an issue scheduling the event.
 * @throws {Error} - If there is an error retrieving the first match of the current week.
 */
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
  getAdjustedMoment,
  getWeekDateRange,
  getMonthDateRange,
  getPeriodMatchdays,
  getMatchdayPeriod,
  getCurrentWeekMatchdays,
  getCurrentMonthMatchdays,
  checkAndScheduleSeasonEndTasks,
  getSettlement,
  getRankingMode,
  scheduleTaskForEndOfMonthMatch,
  getStartAndEndOfCurrentMonth,
  getFirstDaysOfCurrentAndPreviousMonth,
  getSeasonStartDate,
  getMidSeasonDate,
  getFirstMatchOfCurrentWeek,
  scheduleBetsCloseEvent,
}