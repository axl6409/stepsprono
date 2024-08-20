const {Team, Player, PlayerTeamCompetition} = require("../models");
const {getCurrentSeasonYear} = require("./seasonService");
const axios = require("axios");
const logger = require("../utils/logger/logger");
const {Sequelize, Op} = require("sequelize");
const sequelize = require('../../database');
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

const updatePlayers = async function (teamIds = [], competitionId = null) {
  const transaction = await sequelize.transaction();
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

      logger.info(`IDs des joueurs récupérés pour l'équipe ${teamId}:`, apiPlayerIds);

      // Récupérer les associations actuelles uniquement pour cette équipe et cette compétition
      const currentPlayers = await PlayerTeamCompetition.findAll({
        where: {
          team_id: teamId,
          competition_id: competitionId,
        },
        transaction
      });

      const currentPlayerIds = currentPlayers.map(cp => cp.player_id);

      // Mise à jour ou création des joueurs dans la base
      const playersToCreateOrUpdate = apiPlayers.map(apiPlayer => ({
        id: apiPlayer.id,
        name: apiPlayer.name,
        photo: apiPlayer.photo,
      }));

      await Player.bulkCreate(playersToCreateOrUpdate, {
        updateOnDuplicate: ['name', 'photo'], // Met à jour si déjà existant
        transaction
      });

      // Mettre à jour les associations existantes ou en créer de nouvelles
      for (const apiPlayer of apiPlayers) {
        const existingAssociation = currentPlayers.find(cp => cp.player_id === apiPlayer.id);
        if (existingAssociation) {
          // Si l'association existe mais avec une autre équipe, mettre à jour
          if (existingAssociation.team_id !== teamId) {
            await existingAssociation.update({
              team_id: teamId,
              updated_at: new Date(),
            }, { transaction });
            logger.info(`Mise à jour de l'équipe pour le joueur ID: ${apiPlayer.id} vers équipe ID: ${teamId}`);
          }
        } else {
          // Si l'association n'existe pas, la créer
          await PlayerTeamCompetition.create({
            player_id: apiPlayer.id,
            team_id: teamId,
            competition_id: competitionId,
            created_at: new Date(),
            updated_at: new Date(),
          }, { transaction });
          logger.info(`Nouvelle association créée pour le joueur ID: ${apiPlayer.id} avec l'équipe ID: ${teamId}`);
        }
      }

      // Supprimer uniquement les associations obsolètes pour l'équipe en cours de mise à jour
      const associationsToRemove = currentPlayerIds
        .filter(playerId => !apiPlayerIds.includes(playerId));

      if (associationsToRemove.length > 0) {
        await PlayerTeamCompetition.destroy({
          where: {
            player_id: associationsToRemove,
            team_id: teamId,
            competition_id: competitionId,
          },
          transaction
        });
        logger.info(`Associations supprimées pour les joueurs IDs: ${associationsToRemove}`);
      }
    }

    await transaction.commit();
    logger.info(`Mise à jour des joueurs effectuée avec succès`);
  } catch (error) {
    await transaction.rollback();
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