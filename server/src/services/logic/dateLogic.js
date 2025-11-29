// utils/dateLogic.js
const moment = require("moment-timezone");

const DEFAULT_TZ = "Europe/Paris";

function getCurrentMoment(dateString = null, format = null) {
  if (dateString) {
    // si format précisé → on parse avec format
    if (format) {
      return moment.tz(dateString, format, DEFAULT_TZ);
    }
    // sinon on laisse moment détecter
    return moment.tz(dateString, DEFAULT_TZ);
  }

  const iso = process.env.TIME_TRAVEL_ISO;
  const hasIso = !!iso && moment(iso, moment.ISO_8601, true).isValid();

  if (hasIso) {
    return moment.tz(iso, DEFAULT_TZ);
  }

  const offsetDays = Number(process.env.TIME_TRAVEL_OFFSET_DAYS || 0);
  const now = moment().tz(DEFAULT_TZ);
  return offsetDays ? now.clone().add(offsetDays, "days") : now;
}

/** Infos utiles pour debug / endpoint */
function getClockInfo() {
  const now = getCurrentMoment();
  const iso = process.env.TIME_TRAVEL_ISO;
  const offsetDays = Number(process.env.TIME_TRAVEL_OFFSET_DAYS || 0);
  const simulated = !!(iso && moment(iso, moment.ISO_8601, true).isValid()) || !!offsetDays;

  return {
    tz: DEFAULT_TZ,
    nowLocal: now.format(),           // ISO local (avec +02:00)
    nowUTC: now.clone().utc().format(), // ISO en Z
    simulated,
    mode: iso ? "iso" : (offsetDays ? "offsetDays" : "system"),
    value: iso || offsetDays || null,
    week: {
      startUTC: now.clone().startOf("isoWeek").utc().format(),
      endUTC:   now.clone().endOf("isoWeek").utc().format(),
    },
    month: {
      startUTC: now.clone().startOf("month").utc().format(),
      endUTC:   now.clone().endOf("month").utc().format(),
    },
  };
}

function getWeekDateRange() {
  const now = getCurrentMoment();
  return {
    start: now.clone().startOf("isoWeek").utc().format(),
    end:   now.clone().endOf("isoWeek").utc().format(),
  };
}

function getMonthDateRange(monthString = null) {
  let now;
  if (monthString) {
    // monthString format: YYYY-MM
    now = getCurrentMoment(monthString, "YYYY-MM");
  } else {
    now = getCurrentMoment();
  }
  return {
    start: now.clone().startOf("month").utc().format(),
    end:   now.clone().endOf("month").utc().format(),
  };
}

module.exports = {
  getCurrentMoment,
  getClockInfo,
  getWeekDateRange,
  getMonthDateRange,
};
