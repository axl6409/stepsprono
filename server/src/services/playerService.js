const {Team, Player, PlayerTeamCompetition} = require("../models");
const {getCurrentSeasonYear} = require("./seasonService");
const axios = require("axios");
const logger = require("../utils/logger/logger");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

const updatePlayers = async function (teamIds = [], competitionId = null) {
  try {
    let teams = [];
    if (!Array.isArray(teamIds)) {
      teamIds = [teamIds];
    }
    if (teamIds.length > 0) {
      teams = await Team.findAll({
        where: { id: teamIds }
      });
    } else {
      teams = await Team.findAll();
    }
    const seasonYear = await getCurrentSeasonYear(competitionId)
    for (const team of teams) {
      let currentPage = 1;
      let totalPages = 0;
      do {
        const options = {
          method: 'GET',
          url: `${apiBaseUrl}players/`,
          params: {
            team: `${team.id}`,
            season: seasonYear,
            page: currentPage
          },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        };
        const response = await axios.request(options);
        console.log(response)
        const apiPlayers = response.data.response;
        for (const apiPlayer of apiPlayers) {
          let [player, created] = await Player.findOrCreate({
            where: { id: apiPlayer.player.id },
            defaults: {
              name: apiPlayer.player.name,
              firstname: apiPlayer.player.firstname,
              lastname: apiPlayer.player.lastname,
              photo: apiPlayer.player.photo
            }
          });
          if (!created) {
            await Player.update({
              name: apiPlayer.player.name,
              firstname: apiPlayer.player.firstname,
              lastname: apiPlayer.player.lastname,
              photo: apiPlayer.player.photo
            }, {
              where: { id: apiPlayer.player.id }
            });
          }
          const association = await PlayerTeamCompetition.findOne({
            where: {
              playerId: apiPlayer.player.id,
              teamId: team.id,
              competitionId: competitionId
            }
          });
          if (!association) {
            await PlayerTeamCompetition.create({
              playerId: apiPlayer.player.id,
              teamId: team.id,
              competitionId: competitionId
            });
          }
        }

        totalPages = response.data.paging.total;
        currentPage++;
      } while (currentPage <= totalPages);
    }
    logger.info(`Mise à jour des joueurs effectuées avec succès`);
  } catch (error) {
    logger.error(`Erreur lors de le récupération des joueurs: `, error);
  }
}
const getPlayersByTeamId = async (teamId) => {
  try {
    if (!teamId) {
      logger.info('teamId manquant');
      return;
    }
    const players = await PlayerTeamCompetition.findAll({
      where: {
        teamId: teamId
      },
      include: {
        model: Player,
        as: 'Player',
      }
    });
    logger.info('Joueurs récupérés : ', players);
    return players;
  } catch (error) {
    logger.error(`Erreur lors de le récupération des joueurs: `, error);
  }
}

const getPlayerById = async (id) => {
  try {
    if (!id) {
      logger.info('id manquant');
      return;
    }
    const player = await Player.findByPk({
      where: {
        id: id
      },
    });
    logger.info('Joueurs récupérés : ', player);
    return player;
  } catch (error) {
    logger.error(`Erreur lors de le récupération des joueurs: `, error);
  }
}

module.exports = {
  updatePlayers,
  getPlayerById,
  getPlayersByTeamId
};