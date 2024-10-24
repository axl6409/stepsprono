const {Op} = require("sequelize");
const {UserContribution, User} = require("../models");
const logger = require("../utils/logger/logger");
const {getCurrentCompetitionId} = require("./competitionService");
const {getCurrentSeasonId} = require("./seasonService");
const {getCurrentMatchday} = require("./matchService");
const {getMatchdayPeriod} = require("./appService");
const {getMatchdayRanking} = require("./betService");

/**
 * Adds a new contribution for a user.
 *
 * @async
 * @function addUserContribution
 * @param {number} userId - The ID of the user making the contribution.
 * @param {number} [matchday] - The matchday for which the contribution is made. If not provided, the current matchday is used.
 * @return {Promise<{success: boolean, message: string}>} A promise that resolves to an object with a `success` boolean and a `message` string indicating the result of the operation.
 * @throws {Error} If there is an error while adding the contribution.
 */
const addUserContribution = async (userId, matchday) => {
  try {
    const competitionId = await getCurrentCompetitionId()
    const seasonId = await getCurrentSeasonId(competitionId);
    let currentMatchday = matchday || await getCurrentMatchday();
    const createdAt = await getMatchdayPeriod(currentMatchday)

    logger.info('[ADD Contribution]')
    console.log(matchday)
    console.log(currentMatchday)
    console.log(createdAt.endDate)

    const userContribution = await UserContribution.create({
      user_id: userId,
      status: 'pending',
      matchday: currentMatchday,
      season_id: seasonId,
      competition_id: competitionId,
      createdAt: createdAt.endDate,
      updatedAt: createdAt.endDate
    });

    if (userContribution[0] > 0) {
      logger.info(`Contribution ajoutée`);
      return { success: true, message: `Contribution validée avec succès.` };
    } else {
      return { success: false, message: 'Erreur lors de la validation de la contribution.' };
    }

  } catch (error) {
    logger.error('Erreur lors de l\'ajout de la contribution :', error);
    throw error;
  }
};

/**
 * Retrieves all contributions from the database, including the associated users.
 * @async
 * @function getContributionsByUsers
 * @return {Promise<Array<UserContribution>>} A promise resolving to an array of UserContribution objects
 * @throws {Error} If there is an error retrieving the contributions
 */
const getContributionsByUsers = async () => {
  try {
    const contributions = await UserContribution.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'img']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const contributionsByUser = contributions.reduce((acc, contribution) => {
      const userId = contribution.User.id;

      if (!acc[userId]) {
        acc[userId] = {
          user: {
            id: contribution.User.id,
            username: contribution.User.username,
            img: contribution.User.img,
          },
          contributions: []
        };
      }

      acc[userId].contributions.push({
        id: contribution.id,
        status: contribution.status,
        matchday: contribution.matchday,
        createdAt: contribution.createdAt,
        updatedAt: contribution.updatedAt
      });

      return acc;
    }, {});

    return Object.values(contributionsByUser);
  } catch (error) {
    logger.error('Erreur lors de la récupération des contributions :', error);
    throw error;
  }
};

/**
 * Checks for pending contributions of a specific user.
 *
 * @async
 * @function checkUserContribution
 * @param {number} userId - The ID of the user whose contributions are being checked.
 * @return {Promise<Array<UserContribution>|null>} A promise that resolves to an array of UserContribution objects if there are pending contributions, or null if none exist.
 * @throws {Error} If there is an error while retrieving the contributions.
 */
const checkUserContribution = async (userId) => {
  try {
    const pendingContributions = await UserContribution.findAll({
      where: {
        user_id: userId,
        status: 'pending'
      }
    });

    if (pendingContributions.length > 0) {
      return pendingContributions;
    } else {
      return null;
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification des contributions de l\'utilisateur :', error);
    throw error;
  }
};

/**
 * Validates a contribution made by a user.
 *
 * @async
 * @function validateUserContribution
 * @param {number} userId - The ID of the user who made the contribution.
 * @param {number} contributionId - The ID of the contribution to validate.
 * @return {Promise<{success: boolean, message: string}>} A promise that resolves to an object with a `success` boolean and a `message` string.
 * @throws {Error} If there is an error while validating the contribution.
 */
const validateUserContribution = async (contributionId, userId) => {
  try {
    const pendingContribution = await UserContribution.findOne({
      where: {
        id: contributionId,
        user_id: userId,
        status: 'pending'
      }
    });

    if (!pendingContribution) {
      logger.info(`Aucune contribution en attente avec l'ID ${contributionId} pour l'utilisateur avec l'ID ${userId}`);
      return { success: false, message: 'Aucune contribution en attente à valider.' };
    }

    const result = await UserContribution.update(
      { status: 'received' },
      {
        where: {
          user_id: userId,
          id: contributionId,
          status: 'pending'
        }
      }
    );

    if (result[0] > 0) {
      logger.info(`Contribution avec l'ID ${contributionId} validée pour l'utilisateur avec l'ID ${userId}`);
      return { success: true, message: `Contribution validée avec succès.` };
    } else {
      return { success: false, message: 'Erreur lors de la validation de la contribution.' };
    }
  } catch (error) {
    logger.error('Erreur lors de la validation de la contribution de l\'utilisateur :', error);
    throw error;
  }
}

const autoContribution = async (userId) => {
  try {
    const competitionId = await getCurrentCompetitionId()
    const seasonId = await getCurrentSeasonId(competitionId);
    let currentMatchday = await getCurrentMatchday();
    const createdAt = await getMatchdayPeriod(currentMatchday);

    const ranking = await getMatchdayRanking(currentMatchday);
    const usersWithZeroPoints = ranking.filter(user => user.points === 0);
    const minPoints = Math.min(...ranking.filter(user => user.points > 0).map(user => user.points));
    const usersWithMinPoints = ranking.filter(user => user.points === minPoints);
    const usersEligibleForContribution = [...usersWithZeroPoints, ...usersWithMinPoints];
    const userNeedsContribution = usersEligibleForContribution.some(user => user.user_id === userId);

    if (userNeedsContribution) {
      const userContribution = await UserContribution.create({
        user_id: userId,
        status: 'pending',
        matchday: currentMatchday,
        season_id: seasonId,
        competition_id: competitionId,
        createdAt: createdAt.endDate,
        updatedAt: createdAt.endDate
      });

      if (userContribution) {
        logger.info(`Contribution ajoutée pour l'utilisateur avec l'ID ${userId}`);
        return { success: true, message: `Contribution validée avec succès.` };
      } else {
        return { success: false, message: 'Erreur lors de la validation de la contribution.' };
      }
    } else {
      logger.info(`Pas de contribution ajoutée pour l'utilisateur avec l'ID ${userId}, car il ne fait pas partie des utilisateurs ayant 0 points ou le moins de points sur la journée actuelle (${currentMatchday}).`);
      return { success: false, message: 'Pas de contribution nécessaire.' };
    }
  } catch (error) {
    logger.error('Erreur lors de la sélection des contributions :', error);
    throw error;
  }
}
/**
 * Refuses a contribution made by a user.
 *
 * @async
 * @function refuseUserContribution
 * @param {number} userId - The ID of the user who made the contribution.
 * @param {number} contributionId - The ID of the contribution to refuse.
 * @return {Promise<{success: boolean, message: string}>} A promise that resolves to an object with a `success` boolean and a `message` string.
 * @throws {Error} If there is an error while refusing the contribution.
 */
const refuseUserContribution = async (contributionId, userId) => {
  try {
    const receivedContribution = await UserContribution.findOne({
      where: {
        id: contributionId,
        user_id: userId,
        status: 'received'
      }
    });

    if (!receivedContribution) {
      logger.info(`Aucune contribution reçue avec l'ID ${contributionId} pour l'utilisateur avec l'ID ${userId}`);
      return { success: false, message: 'Aucune contribution reçue à refuser.' };
    }

    const result = await UserContribution.update(
      { status: 'pending' },
      {
        where: {
          user_id: userId,
          id: contributionId,
          status: 'received'
        }
      }
    );

    if (result[0] > 0) {
      logger.info(`Contribution avec l'ID ${contributionId} en attente pour l'utilisateur avec l'ID ${userId}`);
      return { success: true, message: `Contribution passée en attente avec succès.` };
    } else {
      return { success: false, message: 'Erreur lors du passage en attente de la contribution.' };
    }
  } catch (error) {
    logger.error('Erreur lors du passage en attente de la contribution de l\'utilisateur :', error);
    throw error;
  }
}

/**
 * Deletes all contributions made by a user.
 *
 * @async
 * @function deleteUserContribution
 * @param {number} id - The ID of the line whose contributions are being deleted.
 * @param {number} userId - The ID of the user whose contributions are being deleted.
 * @return {Promise<{success: boolean, message: string}>} A promise that resolves to an object with a `success` boolean and a `message` string.
 * @throws {Error} If there is an error while deleting the contributions.
 */
const deleteUserContribution = async (id ,userId) => {
  try {
    const result = await UserContribution.destroy({
      where: {
        id: id,
        user_id: userId
      }
    });

    if (result > 0) {
      logger.info(`${result} contribution(s) supprimée(s) pour l'utilisateur avec l'ID ${userId}`);
      return { success: true, message: `${result} contribution(s) supprimée(s)` };
    } else {
      logger.info(`Aucune contribution trouvée pour l'utilisateur avec l'ID ${userId}`);
      return { success: false, message: 'Aucune contribution trouvée pour cet utilisateur.' };
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression des contributions :', error);
    throw error;
  }
}

module.exports = {
  addUserContribution,
  getContributionsByUsers,
  checkUserContribution,
  validateUserContribution,
  autoContribution,
  refuseUserContribution,
  deleteUserContribution
}