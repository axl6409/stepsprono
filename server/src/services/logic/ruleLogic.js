const {getCurrentMatchday} = require("../matchdayService");
const {SpecialRuleResult, Sequelize} = require("../../models");
const {Op} = require("sequelize");

const applySpecialRulePoints = async (seasonId, period, userId, basePoints, matchdays = []) => {
  const ruleResults = await SpecialRuleResult.findAll({
    where: {
      season_id: seasonId,
      config: Sequelize.where(
        Sequelize.cast(Sequelize.json("config.ranking_effect"), "BOOLEAN"),
        true
      )
    }
  });

  if (!ruleResults || ruleResults.length === 0) {
    return basePoints;
  }

  const currentMatchday = await getCurrentMatchday();

  for (const rr of ruleResults) {
    const cfg = rr.config || {};
    let applyRule = false;

    if (period === "week") {
      if (cfg.matchday && Number(cfg.matchday) === Number(currentMatchday)) {
        applyRule = true;
      }
    } else if (period === "month") {
      if (cfg.matchday && matchdays.includes(Number(cfg.matchday))) {
        applyRule = true;
      }
    } else if (period === "season") {
      applyRule = true; // déjà filtré par season_id
    }

    if (applyRule) {
      const specialResults = rr.results || [];
      const sr = specialResults.find(r => Number(r.user_id) === Number(userId));
      if (sr) {
        basePoints += sr.hunt_result || 0;
      }
    }
  }

  return basePoints;
};

module.exports = {
  applySpecialRulePoints
}