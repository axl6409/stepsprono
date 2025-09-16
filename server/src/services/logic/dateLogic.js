// utils/dateLogic.js
const moment = require("moment-timezone");

const getWeekDateRange = () => {
  const now = moment().tz("Europe/Paris");
  // const simNow = moment().set({ 'year': 2024, 'month': 7, 'date': 13 })
  const start = now.clone().startOf('isoWeek');
  const end = now.clone().endOf('isoWeek');
  const startDate = start.clone().utc().format();
  const endDate = end.clone().utc().format();
  return { start: startDate, end: endDate };
};

const getMonthDateRange = () => {
  // const now = moment().set({ 'year': 2025, 'month': 0, 'date': 25 });
  const now = moment().tz("Europe/Paris");
  const start = now.clone().startOf('month');
  const end = now.clone().endOf('month');
  return { start: start, end: end };
};

module.exports = {
  getWeekDateRange,
  getMonthDateRange,
};
