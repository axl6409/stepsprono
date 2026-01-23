const {getCurrentMatchday} = require("../matchdayService");
const {SpecialRuleResult, SpecialRule, Sequelize} = require("../../models");
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
    // Continue pour vérifier balle_perdue même sans autres règles
  } else {
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
  }

  // Appliquer la pénalité balle_perdue de Mystery Box (selon la période)
  try {
    const mysteryBoxRule = await SpecialRule.findOne({
      where: { rule_key: 'mystery_box' }
    });

    if (mysteryBoxRule && mysteryBoxRule.config?.selection) {
      const mysteryBoxMatchday = mysteryBoxRule.config?.matchday;

      // Vérifier si le malus doit s'appliquer selon la période
      let shouldApplyBallePerdue = false;

      if (period === "week") {
        // Pour la semaine, appliquer seulement si on est sur le matchday du mystery-box
        const currentMatchday = await getCurrentMatchday();
        shouldApplyBallePerdue = mysteryBoxMatchday && Number(mysteryBoxMatchday) === Number(currentMatchday);
      } else if (period === "month") {
        // Pour le mois, appliquer si le matchday du mystery-box est dans les matchdays du mois
        shouldApplyBallePerdue = mysteryBoxMatchday && matchdays.includes(Number(mysteryBoxMatchday));
      } else if (period === "season") {
        // Pour la saison, toujours appliquer (cumul)
        shouldApplyBallePerdue = true;
      }

      if (shouldApplyBallePerdue) {
        const mysteryBoxResult = await SpecialRuleResult.findOne({
          where: {
            rule_id: mysteryBoxRule.id,
            season_id: seasonId
          }
        });

        if (mysteryBoxResult?.results) {
          // Chercher si cet utilisateur est la cible d'une balle_perdue
          for (const selection of mysteryBoxRule.config.selection) {
            if (selection.item?.key === 'balle_perdue') {
              // Trouver l'usage de ce balle_perdue
              const usage = mysteryBoxResult.results.find(
                r => Number(r.user_id) === Number(selection.user?.id) && r.item_key === 'balle_perdue' && r.used
              );
              if (usage && Number(usage.data?.target_user_id) === Number(userId)) {
                basePoints -= 1;
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // Ignorer les erreurs de mystery box pour ne pas bloquer le calcul
  }

  return basePoints;
};

module.exports = {
  applySpecialRulePoints
}