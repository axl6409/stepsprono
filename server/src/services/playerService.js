const {Team, Player, PlayerTeamCompetition} = require("../models");
const {getCurrentSeasonYear} = require("./seasonService");
const axios = require("axios");
const logger = require("../utils/logger/logger");
const {Sequelize, Op} = require("sequelize");
const sequelize = require('../../database');
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;

/**
 * Updates the players in the database based on the provided team IDs and competition ID.
 *
 * @param {Array} teamIds - An array of team IDs to update players for. If empty, all teams will be updated.
 * @param {string|null} competitionId - The ID of the competition to update players for. If null, all competitions will be updated.
 * @return {Promise<void>} A promise that resolves when the players have been successfully updated.
 */
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
      const uniquePlayers = Array.from(
        new Map(apiPlayers.map(p => [p.id, {
          id: p.id,
          name: p.name,
          photo: p.photo,
        }])).values()
      );

      await Player.bulkCreate(uniquePlayers, {
        updateOnDuplicate: ['name', 'photo'], // Met à jour si déjà existant
        transaction
      });

      // Mettre à jour les associations existantes ou en créer de nouvelles
      for (const apiPlayer of apiPlayers) {
        const existingAssociation = currentPlayers.find(cp => cp.player_id === apiPlayer.id);
        if (existingAssociation) {
          // Si l'association existe mais avec une autre équipe, mettre à jour
          await existingAssociation.update({
            team_id: teamId,
            number: apiPlayer.number,
            position: apiPlayer.position,
            updated_at: new Date(),
          }, { transaction });
          logger.info(`Mise à jour de l'équipe pour le joueur ID: ${apiPlayer.id} vers équipe ID: ${teamId}`);
        } else {
          // Si l'association n'existe pas, la créer
          await PlayerTeamCompetition.create({
            player_id: apiPlayer.id,
            team_id: teamId,
            competition_id: competitionId,
            number: apiPlayer.number,
            position: apiPlayer.position,
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

/**
 * Retrieves players by team ID.
 *
 * @param {string} teamId - The ID of the team to retrieve players for.
 * @return {Promise<Array<PlayerTeamCompetition>>} A promise that resolves to an array of PlayerTeamCompetition objects representing the players associated with the given team ID.
 * @throws {Error} If there is an error retrieving the players.
 */
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

/**
 * Retrieves a player by their ID.
 *
 * @param {string} id - The ID of the player to retrieve.
 * @return {Promise<Player|undefined>} A promise that resolves to the player object if found, or undefined if not found.
 * @throws {Error} If there is an error retrieving the player.
 */
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

const savePlayer = async ({ id, name, firstname, lastname, photo, teamId, competitionId, number, position }) => {
  const transaction = await sequelize.transaction();
  try {
    let player = await Player.findByPk(id, { transaction });
    if (!player) {
      // création si le joueur n'existe pas
      player = await Player.create({ id, name, firstname, lastname, photo }, { transaction });
    } else {
      // mise à jour infos joueur
      await player.update({ name, firstname, lastname, photo }, { transaction });
    }

    if (teamId) {
      // vérifie si l’association existe déjà
      let association = await PlayerTeamCompetition.findOne({
        where: { player_id: id, team_id: teamId },
        transaction
      });

      if (association) {
        await association.update({ competition_id: competitionId, number, position }, { transaction });
      } else {
        await PlayerTeamCompetition.create({
          player_id: id,
          team_id: teamId,
          competition_id: competitionId,
          number,
          position,
          created_at: new Date(),
          updated_at: new Date(),
        }, { transaction });
      }
    }

    await transaction.commit();
    return { success: true, player };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const createPlayerWithAssociation = async ({ id, name, firstname, lastname, photo, teamId, competitionId, number, position }) => {
  const transaction = await sequelize.transaction();
  try {
    const existingPlayer = await Player.findByPk(id);
    if (existingPlayer) {
      await transaction.rollback();
      return { exists: true, player: existingPlayer };
    }

    const player = await Player.create({ id, name, firstname, lastname, photo }, { transaction });

    if (teamId) {
      await PlayerTeamCompetition.create({
        player_id: id,
        team_id: teamId,
        competition_id: competitionId,
        number,
        position,
        created_at: new Date(),
        updated_at: new Date(),
      }, { transaction });
    }

    await transaction.commit();
    return { exists: false, player };
  } catch (error) {
    await transaction.rollback();
    logger.error(`[createPlayerWithAssociation] Erreur :`, error);
    throw error;
  }
};

const deletePlayerTeam = async (playerId, teamId) => {
  try {
    const deleted = await PlayerTeamCompetition.destroy({
      where: {
        player_id: playerId,
        team_id: teamId
      }
    });

    if (deleted > 0) {
      logger.info(`[deletePlayerTeam] Association supprimée pour joueur ${playerId} et équipe ${teamId}`);
      return { message: "Association supprimée avec succès" };
    } else {
      return { message: "Aucune association trouvée pour ce joueur et cette équipe" };
    }
  } catch (error) {
    logger.error(`[deletePlayerTeam] Erreur :`, error);
    throw error;
  }
};

const getUnassignedPlayers = async () => {
  try {
    const players = await Player.findAll({
      include: [{
        model: PlayerTeamCompetition,
        required: false
      }],
      where: sequelize.literal('"PlayerTeamCompetitions"."player_id" IS NULL')
    });
    return players;
  } catch (error) {
    logger.error("[getUnassignedPlayers] Erreur :", error);
    throw error;
  }
};

module.exports = {
  updatePlayers,
  getPlayerById,
  getPlayersByTeamId,
  savePlayer,
  createPlayerWithAssociation,
  deletePlayerTeam,
  getUnassignedPlayers
};