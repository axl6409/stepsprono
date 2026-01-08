const { Op } = require("sequelize");
const { Bet, Match } = require("../../models");
const logger = require("../../utils/logger/logger");
const { getUserMysteryBoxItem } = require("../mysteryBoxService");

/**
 * Updates a bet with the given parameters.
 *
 * @param {string} options.id - The ID of the bet to update.
 * @param {string} options.userId - The ID of the user making the bet.
 * @param {string} options.matchId - The ID of the match associated with the bet.
 * @param {string|null} options.winnerId - The ID of the winning team, or null for a draw.
 * @param {number|null} options.homeScore - The score of the home team, or null if not applicable.
 * @param {number|null} options.awayScore - The score of the away team, or null if not applicable.
 * @param {string|null} options.scorer - The ID of the scorer, or null if not applicable.
 * @throws {Error} If the match is not found, or if the updated bet is invalid.
 * @return {Promise<Object>} The updated bet object.
 * @param ids
 */
const checkBetByMatchId = async (ids) => {
  try {
    let bets;
    if (Array.isArray(ids)) {
      bets = await Bet.findAll({
        where: {
          [Op.or]: [
            { match_id: { [Op.in]: ids } },
            { id: { [Op.in]: ids } },
          ],
          points: null
        }
      });
    } else {
      bets = await Bet.findAll({
        where: {
          [Op.or]: [
            { match_id: ids },
            { id: ids },
          ],
          points: null
        }
      });
    }
    if (bets.length === 0) {
      logger.info("Aucun pronostic à mettre à jour.");
      return { success: true, message: "Aucun pronostic à mettre à jour." };
    }

    let betsUpdated = 0;
    for (const bet of bets) {
      const match = await Match.findByPk(bet.match_id);
      if (!match) {
        logger.info("[betService] Match non trouvé.");
        return { success: false, message: "[betService] Match non trouvé." };
      }
      if (match.status !== 'FT') {
        logger.info("[betService] Le match n'est pas fini.");
        return { success: false, message: "Le match n'est pas fini." };
      }

      let resultPoints = 0;
      let scorePoints = 0;
      let scorerPoints = 0;

      // Vérifier si l'utilisateur a le bonus double_dose sur ce match
      let hasDoubleDose = false;
      try {
        const mysteryBoxItem = await getUserMysteryBoxItem(bet.user_id);
        if (
          mysteryBoxItem?.item?.key === 'double_dose' &&
          mysteryBoxItem?.usage?.used &&
          mysteryBoxItem?.usage?.data?.match_id === match.id
        ) {
          hasDoubleDose = true;
        }
      } catch (e) {
        logger.warn(`[betLogic] Erreur vérification double_dose pour user ${bet.user_id}: ${e.message}`);
      }

      if (hasDoubleDose && bet.winner_id !== null) {
        // Double Dose: le pari est correct si l'équipe choisie gagne OU si c'est nul
        const isTeamWin = bet.winner_id === match.winner_id;
        const isDraw = match.winner_id === null;
        if (isTeamWin || isDraw) {
          resultPoints = 1;
          logger.info(`[betService] DOUBLE DOSE - Pari validé pour user ${bet.user_id} sur match ${match.id} (team: ${bet.winner_id}, result: ${isTeamWin ? 'win' : 'draw'})`);
        }
      } else if (bet.winner_id === match.winner_id) {
        resultPoints = 1;
      }

      if (match.require_details && bet.home_score !== null && bet.away_score !== null) {
        if (match.goals_home === bet.home_score && match.goals_away === bet.away_score) {
          scorePoints = 3;
        }
      }

      if (match.require_details) {
        const matchScorers = JSON.parse(match.scorers || '[]');

        // Vérifier si l'utilisateur a le bonus buteur_or
        let hasButeurOr = false;
        let hasDoubleButeur = false;
        try {
          const mysteryBoxItem = await getUserMysteryBoxItem(bet.user_id);
          hasButeurOr = mysteryBoxItem?.item?.key === 'buteur_or';
          hasDoubleButeur = mysteryBoxItem?.item?.key === 'double_buteur';
        } catch (e) {
          logger.warn(`[betLogic] Erreur vérification bonus buteur pour user ${bet.user_id}: ${e.message}`);
        }

        if (bet.player_goal) {
          // Double Buteur: format "id1,id2" - vérifier si l'un des deux est correct
          const playerGoals = String(bet.player_goal).split(',').map(p => p.trim()).filter(p => p);

          let scorerFound = false;
          for (const playerGoal of playerGoals) {
            const found = matchScorers.some(scorer => {
              const isScorerMatch = String(scorer.playerId) === String(playerGoal);
              logger.info(`[betService] Vérification du buteur - ID du pronostic: ${playerGoal}, ID du buteur: ${scorer.playerId}, Correspondance: ${isScorerMatch}`);
              return isScorerMatch;
            });
            if (found) {
              scorerFound = true;
              break;
            }
          }

          if (scorerFound) {
            // Buteur en or : 2 points au lieu de 1
            scorerPoints = hasButeurOr ? 2 : 1;
            if (hasButeurOr) {
              logger.info(`[betService] BUTEUR EN OR - Points doublés pour le pronostic ID: ${bet.id}`);
            }
            if (hasDoubleButeur && playerGoals.length > 1) {
              logger.info(`[betService] DOUBLE BUTEUR - Buteur validé parmi ${playerGoals.length} choix pour le pronostic ID: ${bet.id}`);
            }
            logger.info(`[betService] Buteur trouvé pour le pronostic ID: ${bet.id}, Points pour buteur: ${scorerPoints}`);
          } else {
            logger.info(`[betService] Aucun buteur correspondant pour le pronostic ID: ${bet.id}`);
          }
        } else if (matchScorers.length === 0) {
          // Pas de buteur pronostiqué et pas de but dans le match = 1 point (buteur_or ne s'applique pas)
          scorerPoints = 1;
          logger.info(`[betService] Aucun buteur pour le match ID: ${match.id}, et aucun buteur pronostiqué pour le pari ID: ${bet.id}. Attribution d'un point pour buteur par défaut.`);
        }
      }


      const totalPoints = resultPoints + scorePoints + scorerPoints;

      await Bet.update(
        {
          result_points: resultPoints,
          score_points: scorePoints,
          scorer_points: scorerPoints,
          points: totalPoints
        },
        { where: { id: bet.id } }
      );

      betsUpdated++;
    }

    logger.info(`[betService] Pronostics mis à jour : ${betsUpdated}`);
    return { success: true, message: `${betsUpdated} pronostics ont été mis à jour.`, updatedBets: betsUpdated };
  } catch (error) {
    logger.error("[betService] Erreur lors de la mise à jour des pronostics :", error);
    return { success: false, message: "Une erreur est survenue lors de la mise à jour des pronostics.", error: error.message };
  }
};

module.exports = { checkBetByMatchId };