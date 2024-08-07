const {Team, Player, PlayerTeamCompetition} = require("../models");
const {getCurrentSeasonYear} = require("./seasonService");
const axios = require("axios");
const logger = require("../utils/logger/logger");
const {Op} = require("sequelize");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

const updatePlayers = async function (teamIds = [], competitionId = null) {
  try {
    const seasonYear = await getCurrentSeasonYear(competitionId);
    logger.info(`Année de la saison courante : ${seasonYear}`);
    for (const teamId of teamIds) {
      logger.info(`Traitement de l'équipe ID : ${teamId}`);
      let currentPage = 1;
      let totalPages = 0;
      let apiPlayers = [];

      do {
        const options = {
          method: 'GET',
          url: `${apiBaseUrl}players/`,
          params: {
            team: `${teamId}`,
            season: seasonYear,
            page: currentPage
          },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        };
        const response = await axios.request(options);

        logger.info(`Réponse de l'API pour l'équipe ${teamId}, page ${currentPage}:`, response.data);

        apiPlayers = apiPlayers.concat(response.data.response);
        totalPages = response.data.paging.total;
        currentPage++;
      } while (currentPage <= totalPages);

      const apiPlayerIds = apiPlayers.map(player => player.player.id);
      logger.info(`IDs des joueurs récupérés pour l'équipe ${teamId}:`, apiPlayerIds);

      // Log current players in the database for the team
      const currentPlayers = await PlayerTeamCompetition.findAll({
        where: {
          team_id: teamId,
          competition_id: competitionId
        }
      });
      logger.info(`IDs des joueurs actuels dans la base de données pour l'équipe ${teamId}:`, currentPlayers.map(cp => cp.player_id));

      for (const apiPlayer of apiPlayers) {
        const [player, created] = await Player.findOrCreate({
          where: { id: apiPlayer.player.id },
          defaults: {
            name: apiPlayer.player.name,
            firstname: apiPlayer.player.firstname,
            lastname: apiPlayer.player.lastname,
            photo: apiPlayer.player.photo
          }
        });

        if (!created) {
          await player.update({
            name: apiPlayer.player.name,
            firstname: apiPlayer.player.firstname,
            lastname: apiPlayer.player.lastname,
            photo: apiPlayer.player.photo
          });
        }

        // Use findOrCreate to avoid duplicate key errors
        const [association, assocCreated] = await PlayerTeamCompetition.findOrCreate({
          where: {
            player_id: player.id,
            team_id: teamId,
            competition_id: competitionId
          },
          defaults: {
            player_id: player.id,
            team_id: teamId,
            competition_id: competitionId
          }
        });

        if (!assocCreated) {
          logger.info(`Association déjà existante pour le joueur ID: ${player.id}, équipe ID: ${teamId}, compétition ID: ${competitionId}`);
        }
      }

      const playersToRemove = currentPlayers.filter(cp => !apiPlayerIds.includes(cp.player_id));
      logger.info(`Suppression des associations pour les joueurs:`, playersToRemove.map(pr => pr.player_id));

      // Remove associations for players no longer in the team
      await PlayerTeamCompetition.destroy({
        where: {
          team_id: teamId,
          competition_id: competitionId,
          player_id: {
            [Op.notIn]: apiPlayerIds
          }
        }
      });
    }
    logger.info(`Mise à jour des joueurs effectuées avec succès`);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des joueurs: `, error);
  }
};

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