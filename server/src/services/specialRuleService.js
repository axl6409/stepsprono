const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const {SpecialRule, SpecialRuleResult, Sequelize, Match} = require("../models");
const {Op} = require("sequelize");
const { sequelize } = require('../models');
const {schedule, scheduleJob} = require("node-schedule");
const moment = require("moment");
const logger = require("../utils/logger/logger");
const eventBus = require("../events/eventBus");
const { getCurrentMatchday } = require("./matchdayService");
const {getCurrentMatchdayRanking} = require("./logic/rankLogic");
const {status} = require("express/lib/response");
const {getCurrentSeasonId} = require("./logic/seasonLogic");
const {getRanking, getRawRanking} = require("./rankingService");
const {getCurrentCompetitionId} = require("./competitionService");

const toggleSpecialRule = async (id, active) => {
  try {
    const rule = await SpecialRule.findByPk(id);
    if (!rule) return;
    rule.status = active;
    await rule.save();
    logger.info(`[toggleSpecialRule] Special rule ${rule.id} toggled to ${active}`);
  } catch (error) {
    logger.error('[toggleSpecialRule] Error toggling special rule:', error);
  }
}

const getVideoUrlFromRuleKey = (ruleKey) => {
  // Mapping des rule_key vers les noms de fichiers vidéo
  const videoMap = {
    'hunt_day': 'jour-de-chasse',
    'alliance_day': 'alliance-day',
    'hidden_predictions': 'hidden-predictions'
  };

  const videoName = videoMap[ruleKey];
  return videoName ? `/videos/2526-${videoName}.mp4` : null;
};

const getCurrentSpecialRule = async () => {
  try {
    const currentMatchday = parseInt(await getCurrentMatchday(), 10);
    if (!currentMatchday) throw new Error('Current matchday not found');

    // Vérifier si tous les matchs de la journée actuelle sont terminés
    const competitionId = await getCurrentCompetitionId();
    const seasonId = await getCurrentSeasonId(competitionId);

    const matchesOfCurrentMatchday = await Match.findAll({
      where: {
        competition_id: competitionId,
        season_id: seasonId,
        matchday: currentMatchday
      }
    });

    const allMatchesFinished = matchesOfCurrentMatchday.length > 0 &&
      matchesOfCurrentMatchday.every(match => match.status === 'FINISHED');

    // Si tous les matchs sont terminés, chercher la règle de la journée suivante
    let matchdayToSearch = currentMatchday;
    if (allMatchesFinished) {
      logger.info(`[getCurrentSpecialRule] All matches of matchday ${currentMatchday} are finished. Looking for next matchday rule.`);
      matchdayToSearch = currentMatchday + 1;
    }

    // Chercher la règle pour la journée déterminée
    const rule = await SpecialRule.findOne({
      where: {
        status: true,
        [Op.and]: [
          Sequelize.where(
            Sequelize.literal("(config->>'matchday')::int"),
            { [Op.eq]: matchdayToSearch }
          )
        ]
      }
    });

    if (!rule && allMatchesFinished) {
      // Si aucune règle n'est trouvée pour la journée suivante, chercher pour la journée actuelle
      logger.info(`[getCurrentSpecialRule] No rule found for matchday ${matchdayToSearch}. Falling back to current matchday ${currentMatchday}.`);
      const fallbackRule = await SpecialRule.findOne({
        where: {
          status: true,
          [Op.and]: [
            Sequelize.where(
              Sequelize.literal("(config->>'matchday')::int"),
              { [Op.eq]: currentMatchday }
            )
          ]
        }
      });

      // Ajouter dynamiquement le video_url si la règle existe
      if (fallbackRule) {
        const videoUrl = getVideoUrlFromRuleKey(fallbackRule.rule_key);
        if (videoUrl) {
          fallbackRule.config = { ...fallbackRule.config, video_url: videoUrl };
        }
      }

      return fallbackRule;
    }

    // Ajouter dynamiquement le video_url si la règle existe
    if (rule) {
      const videoUrl = getVideoUrlFromRuleKey(rule.rule_key);
      if (videoUrl) {
        rule.config = { ...rule.config, video_url: videoUrl };
      }
    }

    return rule;
  } catch (error) {
    logger.error('[getCurrentSpecialRule] Error getting current special rule:', error);
  }
};

const getSpecialRuleByKey = async (rule_key) => {
  try {
    const rule = await SpecialRule.findOne({
      where: {
        rule_key: rule_key
      }
    })
    if (!rule) return null;
    return rule;
  } catch (e) {
    logger.error('[getSpecialRuleByKey] Error getting special rule:', e);
    throw e;
  }
}

const getSpecialRuleByMatchday = async (matchday) => {
  try {
    const rule = await SpecialRule.findOne({
      where: Sequelize.where(
        Sequelize.cast(Sequelize.json("config.matchday"), "INTEGER"),
        matchday
      ),
    });

    return rule || null;
  } catch (e) {
    logger.error("[getSpecialRuleByMatchday] Error getting special rule:", e);
    throw e;
  }
};

const getSpecialResultByMatchday = async (matchday) => {
  try {
    const rule = await SpecialRuleResult.findOne({
      where: Sequelize.where(
        Sequelize.cast(Sequelize.json("config.matchday"), "INTEGER"),
        matchday
      ),
    });

    return rule || null;
  } catch (e) {
    logger.error("[getSpecialResultByMatchday] Error getting special rule result:", e);
    throw e;
  }
}


const getSpecialRuleResults = async (ruleId) => {
  try {
    const rule = await SpecialRuleResult.findByPk(ruleId);
    if (!rule) return null;
    return rule;
  } catch (e) {
    logger.error('[getSpecialRuleResults] Error getting special rule results:', e);
    throw e;
  }
}

const configSpecialRule = async (ruleId, payload) => {
  try {
    const rule = await SpecialRule.findByPk(ruleId);
    if (!rule) throw new Error('Special rule not found');

    const currentConfig = rule.config || {};
    let newConfig = { ...currentConfig };

    if (payload.config?.matchday) {
      newConfig.matchday = payload.config.matchday;
    }

    logger.info('[configSpecialRule] payload =>', payload);

    if (payload.config?.selected_user) {
      newConfig.selected_user = payload.config.selected_user.id;
    } else if (payload.config?.user_pairs) {
      newConfig.user_pairs = {};
      for (const pair of payload.config.user_pairs) {
        newConfig.user_pairs[pair.id] = pair.id;
      }
    } else if (payload.config?.selected_users) {
      newConfig.selected_users = payload.config.selected_users.map(group =>
        group.map(u => ({
          id: u.id,
          username: u.username,
          img: u.img || null
        }))
      );
    } else if (payload.config?.selection) {
      // Mystery Box: stocker les attributions user/item
      newConfig.selection = payload.config.selection.map(s => ({
        user: {
          id: s.user.id,
          username: s.user.username,
          img: s.user.img || null
        },
        item: {
          key: s.item.key,
          type: s.item.type,
          label: s.item.label,
          max_count: s.item.max_count,
          data: s.item.data || null,
          isPartner: s.item.isPartner || false
        }
      }));
    }

    rule.config = newConfig;

    await rule.save();
    return rule;
  } catch (error) {
    console.error('[configSpecialRule] Error updating rule:', error);
    throw error;
  }
};

const checkSpecialRule = async (rule_key) => {
  const rule = await getSpecialRuleByKey(rule_key);
  if (!rule) return;
  const ruleMatchday = rule.config?.matchday;
  if (rule.config.matchday !== ruleMatchday) return;

  if (rule.rule_key === 'hunt_day') {
    try {
      return checkHuntDay(rule).then(message => message);
    } catch (error) {
      logger.error(`[checkSpecialRule] Erreur lors du traitement de la règle spéciale:`, error);
    }
  }
}

const checkHuntDay = async (rule) => {
  const seasonId = await getCurrentSeasonId(61);
  const ranking = await getRawRanking(seasonId, 'week', rule.config?.matchday);

  if (!Array.isArray(ranking) || ranking.length === 0) {
    return "Aucun classement disponible pour l'instant.";
  }

  const cfg = rule?.config || {};
  const targetUserId = Number(cfg.selected_user);

  if (!Number.isFinite(targetUserId)) {
    logger.warn(`[HUNT DAY] selected_user invalide: ${cfg.selected_user}`);
    return `Utilisateur cible invalide (${cfg.selected_user}).`;
  }

  const targetUser = ranking.find(r => Number(r.user_id) === targetUserId);
  if (!targetUser) {
    return `Utilisateur cible (${targetUserId}) non trouvé dans le classement.`;
  }

  const targetPoints = Number(targetUser.points) || 0;
  const bonus = Number.isFinite(cfg.points_bonus) ? cfg.points_bonus : 1;
  const malus = Number.isFinite(cfg.points_malus) ? cfg.points_malus : -1;

  const results = ranking.map(user => {
    const uid = Number(user.user_id);
    const upoints = Number(user.points) || 0;

    if (uid === targetUserId) {
      return { ...user, hunt_result: 0 };
    }

    let hunt_result = 0;
    if (upoints > targetPoints) hunt_result = bonus;
    else if (upoints < targetPoints) hunt_result = malus;

    return { ...user, hunt_result };
  });

  const configResult = {
    matchday: cfg.matchday,
    ranking_effect: true
  };

  const existing = await SpecialRuleResult.findOne({
    where: {
      rule_id: rule.id,
      season_id: seasonId
    }
  });

  if (existing) {
    await existing.update({
      config: configResult,
      results
    });
    logger.info(`[HUNT DAY] Résultats mis à jour pour la règle ${rule.id} (saison ${seasonId})`);
  } else {
    await SpecialRuleResult.create({
      rule_id: rule.id,
      season_id: seasonId,
      config: configResult,
      results,
    });
    logger.info(`[HUNT DAY] Résultats enregistrés pour la règle ${rule.id} (saison ${seasonId})`);
  }

  return results;
};

module.exports = {
  toggleSpecialRule,
  getCurrentSpecialRule,
  configSpecialRule,
  checkSpecialRule,
  getSpecialRuleByMatchday,
  getSpecialResultByMatchday
}