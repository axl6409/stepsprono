// services/matchdayService.js
const { Op } = require("sequelize");
const { Match, Season } = require("../models");
const { getWeekDateRange, getMonthDateRange } = require("./logic/dateLogic");
const { getCurrentCompetitionId } = require("./competitionService");
const {getCurrentSeasonId} = require("./logic/seasonLogic")
const { getCurrentSeason} = require("./seasonService");
const logger = require("../utils/logger/logger");

const getCurrentWeekMatchdays = async (seasonIdParam) => {
  const matchdays = [];
  const { start, end } = getWeekDateRange();
  const competitionId = await getCurrentCompetitionId();
  const seasonId = seasonIdParam || await getCurrentSeasonId(competitionId);

  const matches = await Match.findAll({
    where: {
      competition_id: competitionId,
      season_id: seasonId,
      utc_date: { [Op.between]: [start, end] }
    }
  });

  return [...new Set(matches.map(m => m.matchday))];
};

const getCurrentMonthMatchdays = async (seasonIdParam, month = null) => {
  const { start, end } = getMonthDateRange(month);
  const competitionId = await getCurrentCompetitionId();
  const seasonId = seasonIdParam || await getCurrentSeasonId(competitionId);

  const matches = await Match.findAll({
    where: {
      competition_id: competitionId,
      season_id: seasonId,
      utc_date: { [Op.between]: [start, end] }
    }
  });

  return [...new Set(matches.map(m => m.matchday))];
};

const getCurrentMatchday = async () => {
  const competitionId = await getCurrentCompetitionId();
  const seasonId = await getCurrentSeasonId(competitionId);
  const { start, end } = getWeekDateRange();

  const matches = await Match.findAll({
    where: {
      competition_id: competitionId,
      season_id: seasonId,
      utc_date: {
        [Op.between]: [start, end]
      }
    },
    order: [["utc_date", "ASC"]]
  });

  return matches.length ? matches[matches.length - 1].matchday : null;
};

const updateCurrentMatchday = async () => {
  try {
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);
    const { start, end } = getWeekDateRange();

    const matches = await Match.findAll({
      where: {
        competition_id: competitionId,
        season_id: seasonId,
        utc_date: {
          [Op.between]: [start, end]
        }
      },
      order: [["utc_date", "ASC"]]
    });

    const matchday = matches.length ? matches[matches.length - 1].matchday : null;

    const newSeason = await Season.update(
      { currentMatchday: matchday },
      { where: { id: seasonId } }
    )
    return newSeason
  } catch (error) {
    console.log('updateCurrentMatchday ERROR: ', error)
  }
}

module.exports = {
  getCurrentWeekMatchdays,
  getCurrentMonthMatchdays,
  getCurrentMatchday,
  updateCurrentMatchday
};
