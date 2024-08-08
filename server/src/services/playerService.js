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
    for (const teamId of teamIds) {
      logger.info(`Traitement de l'équipe ID : ${teamId}`);

      const options = {
        method: "GET",
        url: `${apiBaseUrl}players/squads`,
        params: {
          team: `${teamId}`,
        },
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": apiHost,
        },
      };

      const response = await axios.request(options);
      const apiPlayers = response.data.response[0].players;

      const apiPlayerIds = apiPlayers.map((player) => player.id);
      logger.info(
          `IDs des joueurs récupérés pour l'équipe ${teamId}:`,
          apiPlayerIds
      );

      const currentPlayers = await PlayerTeamCompetition.findAll({
        where: {
          team_id: teamId,
          competition_id: competitionId,
        },
      });

      logger.info(
          `IDs des joueurs actuels dans la base de données pour l'équipe ${teamId}:`,
          currentPlayers.map((cp) => cp.player_id)
      );

      for (const apiPlayer of apiPlayers) {
        const [player, created] = await Player.findOrCreate({
          where: { id: apiPlayer.id },
          defaults: {
            name: apiPlayer.name,
            age: apiPlayer.age,
            photo: apiPlayer.photo,
          },
        });

        if (!created) {
          await player.update({
            name: apiPlayer.name,
            age: apiPlayer.age,
            photo: apiPlayer.photo,
          });
        }

        // Vérifier si l'association existe déjà avant de la créer
        const existingAssociation = await PlayerTeamCompetition.findOne({
          where: {
            player_id: player.id,
            team_id: teamId,
            competition_id: competitionId,
          },
        });

        if (!existingAssociation) {
          try {
            await PlayerTeamCompetition.create({
              player_id: player.id,
              team_id: teamId,
              competition_id: competitionId,
            });
            logger.info(
                `Association créée pour le joueur ID: ${player.id}, équipe ID: ${teamId}, compétition ID: ${competitionId}`
            );
          } catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
              logger.warn(
                  `Contrainte d'unicité violée pour le joueur ID: ${player.id}, équipe ID: ${teamId}, compétition ID: ${competitionId}`
              );
            } else {
              throw error;
            }
          }
        } else {
          logger.info(
              `Association déjà existante pour le joueur ID: ${player.id}, équipe ID: ${teamId}, compétition ID: ${competitionId}`
          );
        }
      }

      // Supprimer les associations pour les joueurs qui ne sont plus dans l'équipe
      const playersToRemove = currentPlayers.filter(
          (cp) => !apiPlayerIds.includes(cp.player_id)
      );

      logger.info(
          `Suppression des associations pour les joueurs:`,
          playersToRemove.map((pr) => pr.player_id)
      );

      await PlayerTeamCompetition.destroy({
        where: {
          team_id: teamId,
          competition_id: competitionId,
          player_id: {
            [Op.notIn]: apiPlayerIds,
          },
        },
      });
    }
    logger.info(`Mise à jour des joueurs effectuée avec succès`);
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