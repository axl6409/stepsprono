const {Op} = require("sequelize");
const {Bet, Match, Team} = require("../models");
const {getCurrentWeekMatchdays, getCurrentMonthMatchdays} = require("./appService");
const logger = require("../utils/logger/logger");
const {getCurrentSeasonId} = require("./seasonService");

const checkupBets = async (betId) => {
  try {
    if (betId) {
      if (Array.isArray(betId)) {
        for (const id of betId) {
          const result = await checkBetByMatchId(id);
          if (!result.success) {
            return { success: false, message: result.message };
          }
        }
      } else {
        const result = await checkBetByMatchId(betId);
        if (!result.success) {
          return { success: false, message: result.message };
        }
      }
      return { success: true, message: "Pronostics vérifiés avec succès." };
    }
    return { success: false, message: "Aucun identifiant de pronostic fourni." };
  } catch (error) {
    logger.info('Erreur lors de la vérification des pronostics:', error);
    return { success: false, message: "Une erreur est survenue lors de la vérification des pronostics.", error: error.message };
  }
};

const getNullBets = async () => {
  try {
    return await Bet.findAll({
      where: {
        points: {
          [Op.eq]: null
        }
      },
      include: [{
        model: Match,
        as: 'MatchId',
        // where: {
        //   status: 'FT'
        // },
        include: [
          {
            model: Team,
            as: 'HomeTeam'
          },
          {
            model: Team,
            as: 'AwayTeam'
          }
        ]
      }]
    });
  } catch (error) {
    console.log('Erreur lors de la recuperation des paris nuls:', error);
  }
}

const getWeekPoints = async (seasonId, userId) => {
  try {
    const matchdays = await getCurrentWeekMatchdays(seasonId);
    console.log('Matchdays for the week:', matchdays);
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
        matchday: {
          [Op.in]: matchdays
        },
        points: {
          [Op.not]: null
        }
      }
    });
    let points = 0;
    console.log('bets => ' + bets)
    for (const bet of bets) {
      points += bet.points;
    }
    console.log(`Total points for user ${userId} in week:`, points);
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
    return 0;
  }
}

const getMonthPoints = async (seasonId, userId) => {
  try {
    const matchdays = await getCurrentMonthMatchdays(seasonId);
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
        matchday: {
          [Op.in]: matchdays
        },
        points: {
          [Op.not]: null
        }
      }
    });
    let points = 0;
    for (const bet of bets) {
      points += bet.points;
    }
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
    return 0;
  }
}

const getSeasonPoints = async (seasonId, userId) => {
  try {
    const bets = await Bet.findAll({
      where: {
        season_id: seasonId,
        user_id: userId,
        points: {
          [Op.not]: null
        }
      }
    });
    let points = 0;
    for (const bet of bets) {
      points += bet.points;
    }
    return points;
  } catch (error) {
    console.log('Erreur lors de la recuperation des points:', error);
    return 0;
  }
}

const calculatePoints = (wins, draws, loses) => {
  return (wins * 3) + draws;
}

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
          points: { [Op.eq]: null }
        }
      });
    } else {
      bets = await Bet.findAll({
        where: {
          [Op.or]: [
            { match_id: ids },
            { id: ids },
          ],
          points: { [Op.eq]: null }
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
        logger.info("Match non trouvé.");
        return { success: false, message: "Match non trouvé." };
      }
      if (match.status !== 'FT') {
        logger.info("Le match n'est pas fini.");
        return { success: false, message: "Le match n'est pas fini." };
      }
      let points = 0;
      if (bet.winner_id === match.winner_id) {
        points += 1;
      }
      if (bet.home_score !== null && bet.away_score !== null) {
        if (match.goals_home === bet.home_score && match.goals_away === bet.away_score) {
          points += 3;
        }
      }
      if (bet.player_goal) {
        const matchScorers = JSON.parse(match.scorers || '[]');
        const scorerFound = matchScorers.some(scorer => scorer.playerId === bet.player_goal);
        logger.info("matchScorers:", matchScorers);
        logger.info("scorerFound:", scorerFound);
        if (scorerFound) {
          points += 1;
        }
      }
      await Bet.update({ points }, { where: { id: bet.id } });
      betsUpdated++;
    }
    logger.info(`Pronostics mis à jour : ${betsUpdated}`);
    return { success: true, message: `${betsUpdated} pronostics ont été mis à jour.`, updatedBets: betsUpdated };
  } catch (error) {
    logger.error("Erreur lors de la mise à jour des pronostics :", error);
    return { success: false, message: "Une erreur est survenue lors de la mise à jour des pronostics.", error: error.message };
  }
};

const createBet = async ({ userId, matchday, matchId, winnerId, homeScore, awayScore, scorer }) => {
  try {
    logger.info('DATAS =>', { userId, matchday, matchId, winnerId, homeScore, awayScore, scorer });
    const match = await Match.findOne({
      where: {id: matchId},
    });
    if (!match) {
      throw new Error('Match non trouvé');
    }
    const existingBet = await Bet.findOne({
      where: {
        user_id: userId,
        match_id: matchId
      }
    });
    if (existingBet) {
      throw new Error('Un prono existe déjà pour ce match');
    }
    if (winnerId === null) {
      if (homeScore !== awayScore) {
        throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
      }
    } else {
      if ((winnerId === match.home_team_id && parseInt(homeScore) <= parseInt(awayScore)) || (winnerId === match.away_team_id && parseInt(awayScore) <= parseInt(homeScore))) {
        throw new Error('Le score doit être en rapport avec l\'équipe gagnante désignée');
      }
    }
    const competitionId = 61
    const seasonId = await getCurrentSeasonId(competitionId);

    console.log("Scorer => ", scorer);
    const bet = await Bet.create({
      user_id: userId,
      season_id: seasonId,
      competition_id: competitionId,
      matchday: matchday,
      match_id: matchId,
      winner_id: winnerId,
      home_score: homeScore,
      away_score: awayScore,
      player_goal: scorer ? scorer : null
    });
    return bet;
  } catch (error) {
    logger.error('Erreur lors de la creation du pronostic :', error);
    throw error;
  }
};

const updateBet = async ({ id, userId, matchId, winnerId, homeScore, awayScore, scorer }) => {
  logger.info('updateBet', { id, userId, matchId, winnerId, homeScore, awayScore, scorer });
  try {
    const match = await Match.findOne({
      where: { id: matchId },
    });
    if (!match) {
      throw new Error('Match non trouvé');
    }
    const bet = await Bet.findByPk(id);
    if (!bet) {
      logger.error('Pronostic non trouvé');
      throw new Error('Pronostic non trouvé');
    }
    const updatedFields = {};
    if (winnerId !== undefined) updatedFields.winner_id = winnerId;
    if (homeScore !== undefined) updatedFields.home_score = homeScore;
    if (awayScore !== undefined) updatedFields.away_score = awayScore;
    if (scorer !== undefined) updatedFields.player_goal = scorer;

    if (winnerId === null) {
      if (homeScore !== awayScore) {
        throw new Error('Le score n\'est pas valide, un match nul doit avoir un score identique pour les deux équipes');
      }
    } else {
      if ((winnerId === match.home_team_id && parseInt(homeScore) <= parseInt(awayScore)) ||
        (winnerId === match.away_team_id && parseInt(awayScore) <= parseInt(homeScore))) {
        throw new Error('Le score doit être en rapport avec l\'équipe gagnante désignée');
      }
    }
    await bet.update(updatedFields);
    return bet;
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du prono: ', error);
    throw error;
  }
}

module.exports = {
  calculatePoints,
  checkBetByMatchId,
  checkupBets,
  getNullBets,
  getWeekPoints,
  getMonthPoints,
  getSeasonPoints,
  createBet,
  updateBet,
};