const { User, Reward, UserReward } = require('../models');
const path = require('path');
const {deleteFile} = require("../utils/utils");
const logger = require("../utils/logger/logger");
const {getUserRank, getUserPointsForWeek, getUserRankByPeriod, checkUserCorrectPredictions,
  checkUserIncorrectPredictions, checkUserZeroPredictions, checkExactScorePredictions, checkIncorrectScorePredictions,
  getUserTopRankingStatus, getUserBottomRankingStatus, checkNoPredictionsForWeek, checkCorrectMatchFullPrediction,
  checkIncorrectMatchFullPrediction, checkHomeTeamBets, checkAwayTeamBets, checkVisionaryBet, checkBlindBet,
  getExactScorePredictionsCount, getUserTopRankingForTwoMonths, getUserSecondPlaceForTwoMonths,
  getLongestCorrectPredictionStreak, getLongestIncorrectPredictionStreak, getCorrectPredictionsForFavoriteTeam,
  getPredictedVictoriesForFavoriteTeam, getCorrectScorerPredictionsCount, getUniqueTrophiesCount,
  getTotalPointsForSeason, hasUserWonPreviousSeason, getSeasonWinner, getUserPointsForSeason
} = require("./userService");
const {getWeekDateRange, getFirstDaysOfCurrentAndPreviousMonth, getSeasonStartDate, getMidSeasonDate,
  getStartAndEndOfCurrentMonth
} = require("./appService");
const {getCurrentSeasonYear, getCurrentSeasonId, getSeasonDates, getCurrentSeason} = require("./seasonService");
const {Op} = require("sequelize");

/**
 * Retrieves all rewards from the database.
 *
 * @return {Promise<Array<Reward>>} A promise that resolves to an array of Reward objects.
 */
const getAllRewards = async () => {
  return await Reward.findAll();
};

const getRewardById = async (id) => {
  return await Reward.findByPk(id);
}

/**
 * Retrieves all rewards for a given user from the database.
 *
 * @param {number} userId - The ID of the user.
 * @return {Promise<Array<UserReward>>} A promise that resolves to an array of UserReward objects.
 * @throws {Error} If there is an error retrieving the rewards.
 */
const getUserRewards = async (userId) => {
  try {
    const rewards = await UserReward.findAll({
      where: {
        user_id: userId
      }
    });
    return rewards;
  } catch (error) {
    console.log("Error getting reward => ", error);
    throw error;
  }
};

/**
 * Creates a new reward in the database with the provided data and file.
 *
 * @param {Object} data - The data for the reward.
 * @param {Object} file - The file for the reward (optional).
 * @return {Promise<Object>} The created reward object.
 * @throws {Error} If there is an error creating the reward.
 */
const createReward = async (data, file) => {
  try {
    const { name, description, slug, rank } = data;
    const reward = await Reward.create({
      name,
      description,
      slug,
      rank,
      image: file ? file.filename : null,
      active: data.active !== undefined ? data.active : true,
      type: data.type || 'trophy'
    });
    return reward;
  } catch (error) {
    console.log("Error creating reward => ", error);
    throw error;
  }
};

/**
 * Updates a reward in the database with the provided data and file.
 *
 * @param {number} id - The ID of the reward to update.
 * @param {Object} data - The data for the reward.
 * @param {Object} file - The file for the reward (optional).
 * @return {Promise<Object>} The updated reward object.
 * @throws {Error} If the reward is not found.
 */
const updateReward = async (id, data, file) => {
  const reward = await Reward.findByPk(id);
  if (!reward) throw new Error('Reward not found');

  const { name, description, slug, rank } = data;
  reward.name = name;
  reward.description = description;
  reward.slug = slug;
  reward.rank = rank;
  if (file) reward.image = file.filename;

  await reward.save();
  return reward;
};

/**
 * Deletes a reward from the database.
 *
 * @param {number} id - The ID of the reward to delete.
 * @return {Promise<void>} - A promise that resolves when the reward is deleted.
 * @throws {Error} - If the reward is not found.
 */
const deleteReward = async (id) => {
  try {
    const reward = await Reward.findByPk(id);
    if (!reward) throw new Error('Reward not found');

    if (reward.image) {
      const imagePath = path.join(__dirname, '../../../client/src/assets/uploads/trophies', reward.image);
      deleteFile(imagePath);
    }

    await reward.destroy();
  } catch (error) {
    logger.error("Error deleting reward => ", error);
    throw error;
  }
};

/**
 * Toggles the activation status of a reward in the database.
 *
 * @param {number} id - The ID of the reward to toggle activation for.
 * @param {boolean} active - The new activation status of the reward.
 * @return {Promise<Object>} The updated reward object.
 * @throws {Error} If the reward is not found.
 */
const toggleActivation = async (id, active) => {
  const reward = await Reward.findByPk(id);
  if (!reward) throw new Error('Reward not found');
  reward.active = active;
  await reward.save();
  return reward;
};

/**
 * Assigns a reward to a user. If the reward already exists for the user, increments the count.
 *
 * @param {Object} data - The data object containing user_id, reward_id, and count.
 * @param {number} data.user_id - The ID of the user to assign the reward to.
 * @param {number} data.reward_id - The ID of the reward to assign.
 * @param {number} data.count - The count of the reward to assign.
 * @return {Promise<void>} - A promise that resolves when the reward is assigned or incremented.
 * @throws {Error} - If an error occurs while assigning the reward.
 */
const assignReward = async (data) => {
  try {
    const { user_id, reward_id, count } = data;
    const existingReward = await UserReward.findOne({
      where: {
        user_id: user_id,
        reward_id: reward_id
      }
    });
    if (!existingReward) {
      await UserReward.create({
        user_id,
        reward_id,
        count
      });
      logger.info(`Trophée attribué à l'utilisateur ${user_id}`);
    } else {
      console.log(`Avant incrémentation : ${JSON.stringify(existingReward)}`);
      existingReward.count += 1;
      await existingReward.save();
      console.log(`Après incrémentation : ${JSON.stringify(existingReward)}`);
      logger.info(`Trophée réattribué à l'utilisateur ${user_id}`);
    }
  } catch (error) {
    logger.warn("Error assigning reward => ", error);
    throw error;
  }
};

/**
 * Removes a reward from a user. If the reward exists and has a count greater than 1, decrements the count.
 * If the reward exists and has a count of 1, deletes the reward.
 *
 * @param {Object} data - The data object containing user_id and reward_id.
 * @param {number} data.user_id - The ID of the user to remove the reward from.
 * @param {number} data.reward_id - The ID of the reward to remove.
 * @return {Promise<void>} - A promise that resolves when the reward is removed or decremented.
 * @throws {Error} - If the user does not have the reward or an error occurs while removing the reward.
 */
const removeReward = async (data) => {
  try {
    const { user_id, reward_id } = data;
    const existingReward = await UserReward.findOne({
      where: {
        user_id: user_id,
        reward_id: reward_id,
      },
    });

    if (!existingReward) {
      throw new Error(`L'utilisateur ${user_id} n'a pas ce trophée.`);
    } else {
      if (existingReward.count > 1) {
        existingReward.count -= 1;
        await existingReward.save();
        logger.info(`Trophée retiré à l'utilisateur ${user_id}, il en reste ${existingReward.count}.`);
      } else {
        await existingReward.destroy();
        logger.info(`Trophée entièrement retiré à l'utilisateur ${user_id}.`);
      }
    }
  } catch (error) {
    logger.warn("Erreur lors du retrait du trophée => ", error);
    throw error;
  }
};

// **************************
// Trophies attribution Logic
// **************************

/**
 * Checks the Phoenix Trophy for the users.
 *
 * This function retrieves all users and calculates their rank at the end of the last month.
 * If a user's rank at the end of the last month is the highest and their rank at the end of the current month is 1,
 * they are awarded the Phoenix Trophy.
 * If the user does not already have the trophy, it is created and assigned to them.
 * If the user already has the trophy, its count is incremented by 1.
 *
 * @return {Promise<void>} A Promise that resolves when the function completes.
 */
const checkPhoenixTrophy = async () => {
  try {
    const reward = await getRewardById(5);
    if (reward.active === false) {
      logger.info("Trophee Phoenix non actif");
      return;
    }
    const endOfLastMonth = new Date();
    endOfLastMonth.setMonth(endOfLastMonth.getMonth() - 1);

    const endOfCurrentMonth = new Date();
    const users = await User.findAll();

    for (const user of users) {
      const lastMonthRank = await getUserRank(user.id, endOfLastMonth);
      const currentMonthRank = await getUserRank(user.id, endOfCurrentMonth);

      if (lastMonthRank === users.length && currentMonthRank === 1) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 5,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 5,
            count: 1,
          });

          logger.info(`Trophée Le Phénix attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le Phénix attribuite à l'utilisateur ${user.username}`);
        }
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Phénix:", error);
  }
};

/**
 * Checks the Rising Star Trophy for the users.
 *
 * This function retrieves all users and calculates their rank at the end of the first month.
 * If a user's rank is less than or equal to 3, they are awarded the Rising Star Trophy.
 * If the user does not already have the trophy, it is created and assigned to them.
 * If the user already has the trophy, its count is incremented by 1.
 *
 * @return {Promise<void>} A Promise that resolves when the function completes.
 */
const checkRisingStarTrophy = async () => {
  try {
    const reward = await getRewardById(6);
    if (reward.active === false) {
      logger.info("Trophee Rising Star non actif");
      return;
    }

    const currentSeason = await getCurrentSeasonYear(61);
    const seasonStartDate = await getSeasonStartDate(currentSeason);
    const endOfFirstMonth = new Date(seasonStartDate);
    endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() + 1);

    const users = await User.findAll();

    let highestPoints = 0;
    let topUsers = [];

    for (const user of users) {
      const { userRank, pointsAtDate } = await getUserRank(user.id, seasonStartDate, endOfFirstMonth);

      if (userRank === 1) {
        const userPoints = pointsAtDate.find((entry) => entry.user_id === user.id).dataValues.points;

        if (userPoints > highestPoints) {
          highestPoints = userPoints;
          topUsers = [user];
        } else if (userPoints === highestPoints) {
          topUsers.push(user);
        }
      }
    }

    // Attribution du trophée
    for (const user of topUsers) {
      const existingReward = await UserReward.findOne({
        where: {
          user_id: user.id,
          reward_id: 6,
        },
      });

      if (!existingReward) {
        await UserReward.create({
          user_id: user.id,
          reward_id: 6,
          count: 1,
        });
        logger.info(`Trophée L'Étoile Montante attribué à l'utilisateur ${user.username}`);
      } else {
        existingReward.count += 1;
        await existingReward.save();
        logger.info(`Trophée L'Étoile Montante réattribué à l'utilisateur ${user.username}`);
      }
    }

  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'Étoile Montante:", error);
  }
};

/**
 * Checks the Massacre Trophy for the users.
 *
 * This function retrieves all users and calculates their points for the current week.
 * The user with the highest points is awarded the Massacre Trophy.
 * If multiple users have the same maximum points, all of them are awarded the trophy.
 *
 * @return {Promise<void>} A Promise that resolves when the function completes.
 */
const checkMassacreTrophy = async () => {
  try {
    const reward = await getRewardById(7);
    if (reward.active === false) {
      logger.info("Trophee Massacre non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();
    let topUsers = [];
    let maxPoints = 0;

    for (const user of users) {
      const userPoints = await getUserPointsForWeek(user.id, startOfWeek, endOfWeek);

      if (userPoints === null) {
        logger.info(`L'utilisateur ${user.username} n'a fait aucun pari cette semaine.`);
        continue;
      }

      if (userPoints > maxPoints) {
        maxPoints = userPoints;
        topUsers = [user];
      } else if (userPoints === maxPoints) {
        topUsers.push(user);
      }
    }

    if (topUsers.length > 0) {
      for (const topUser of topUsers) {
        logger.info('Top User ID => ' + topUser.id);

        const existingReward = await UserReward.findOne({
          where: {
            user_id: topUser.id,
            reward_id: 30,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: topUser.id,
            reward_id: 30,
            count: 1,
          });
          logger.info(`Trophée Massacre ! attribué à l'utilisateur ${topUser.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Massacre ! réattribué à l'utilisateur ${topUser.username}`);
        }
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Massacre ! :", error);
  }
};

/**
 * Checks the Khalass Trophy for the users.
 *
 * This function retrieves all users and calculates their points for the current week.
 * The user with the lowest points is awarded the Khalass Trophy.
 * If multiple users have the same minimum points, all of them are awarded the trophy.
 *
 * @return {Promise<void>} A Promise that resolves when the function completes.
 */
const checkKhalassTrophy = async () => {
  try {
    const reward = await getRewardById(8);
    if (reward.active === false) {
      logger.info("Trophee Khalass non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();
    let bottomUsers = [];
    let minPoints = Infinity;

    for (const user of users) {
      const userPoints = await getUserPointsForWeek(user.id, startOfWeek, endOfWeek);

      if (userPoints === null) {
        logger.info(`L'utilisateur ${user.username} n'a fait aucun pari cette semaine.`);
        continue;
      }

      if (userPoints < minPoints) {
        minPoints = userPoints;
        bottomUsers = [user];
      } else if (userPoints === minPoints) {
        bottomUsers.push(user);
      }
    }

    if (bottomUsers.length > 0) {
      for (const bottomUser of bottomUsers) {
        logger.info('Bottom User ID => ' + bottomUser.id);

        const existingReward = await UserReward.findOne({
          where: {
            user_id: bottomUser.id,
            reward_id: 31,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: bottomUser.id,
            reward_id: 31,
            count: 1,
          });
          logger.info(`Trophée Underdog attribué à l'utilisateur ${bottomUser.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Underdog réattribué à l'utilisateur ${bottomUser.username}`);
        }
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Underdog ! :", error);
  }
};

/**
 * Checks if any user is a challenger for the current month and awards the "Le Challenger" trophy if they are.
 *
 * @return {Promise<void>} - A promise that resolves when the function completes.
 */
const checkChallengerTrophy = async () => {
  try {
    const reward = await getRewardById(9);
    if (reward.active === false) {
      logger.info("Trophee Le Challenger non actif");
      return;
    }
    const currentMonth = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(currentMonth.getMonth() - 2);

    const users = await User.findAll();
    let trophyAwarded = false;

    for (const user of users) {
      const isChallenger = await getUserRankByPeriod(user.id, twoMonthsAgo, currentMonth);

      if (isChallenger) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 17,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 17,
            count: 1,
          });
          logger.info(`Trophée Le Challenger attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le Challenger réattribué à l'utilisateur ${user.username}`);
        }

        trophyAwarded = true;
      }
    }

    if (!trophyAwarded) {
      logger.info("Aucun utilisateur ne remplit les conditions pour le trophée Le Challenger ce mois-ci.");
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Challenger:", error);
  }
};

/**
 * Checks if the user has correctly predicted all the winners this week and awards them the "L'Oracle" trophy if they have.
 *
 * @return {Promise<void>} - Returns a Promise that resolves when the function completes.
 */
const checkOracleTrophy = async () => {
  try {
    const reward = await getRewardById(10);
    if (reward.active === false) {
      logger.info("Trophee L'Oracle non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const correctPredictions = await checkUserCorrectPredictions(user.id, startOfWeek, endOfWeek);

      if (correctPredictions) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 20,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 20,
            count: 1,
          });
          logger.info(`Trophée L'Oracle attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée L'Oracle réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas correctement prédit tous les vainqueurs cette semaine.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'Oracle:", error);
  }
};

/**
 * Checks if each user has incorrectly predicted all the winners this week and awards them the "Le Chat Noir" trophy if they have.
 *
 * @return {Promise<void>} - Returns a Promise that resolves when the function completes.
 */
const checkBlackCatTrophy = async () => {
  try {
    const reward = await getRewardById(11);
    if (reward.active === false) {
      logger.info("Trophee Le Chat Noir non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const incorrectPredictions = await checkUserIncorrectPredictions(user.id, startOfWeek, endOfWeek);

      if (incorrectPredictions) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 21,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 21,
            count: 1,
          });
          logger.info(`Trophée Le Chat Noir attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le Chat Noir réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas prédit incorrectement tous les vainqueurs cette semaine.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Chat Noir:", error);
  }
};

/**
 * Checks if the users have correctly predicted zero-scoring matches and awards the "Le Gardien du Zéro" trophy.
 *
 * @return {Promise<void>} - A Promise that resolves when the function completes.
 */
const checkZeroGuardianTrophy = async () => {
  try {
    const reward = await getRewardById(7);
    if (reward.active === false) {
      logger.info("Trophee Le Gardien du Zéro non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const correctZeroPredictions = await checkUserZeroPredictions(user.id, startOfWeek, endOfWeek);

      if (correctZeroPredictions) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 7,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 7,
            count: 1,
          });
          logger.info(`Trophée Le Gardien du Zéro attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le Gardien du Zéro réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas correctement prédit de match 0-0 cette semaine.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Gardien du Zéro:", error);
  }
};

/**
 * Checks if any user has predicted an exact score for all matches within a week and assigns the Jackpot Trophy if so.
 *
 * @return {Promise<void>} - A Promise that resolves when the function completes.
 */
const checkJackpotTrophy = async () => {
  try {
    const reward = await getRewardById(8);
    if (reward.active === false) {
      logger.info("Trophee Jackpot non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const hasExactScore = await checkExactScorePredictions(user.id, startOfWeek, endOfWeek);

      if (hasExactScore) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 8,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 8,
            count: 1,
          });
          logger.info(`Trophée Jackpot attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Jackpot réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas correctement prédit un score exact cette semaine.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Jackpot:", error);
  }
};

/**
 * Checks if any user has made incorrect score predictions for all matches within a week and assigns the Looser Trophy if so.
 *
 * @return {Promise<void>} - A Promise that resolves when the function completes.
 * @throws {Error} - If there is an error during the verification process.
 */
const checkLooserTrophy = async () => {
  try {
    const reward = await getRewardById(9);
    if (reward.active === false) {
      logger.info("Trophee Looser non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const hasIncorrectPredictions = await checkIncorrectScorePredictions(user.id, startOfWeek, endOfWeek);

      if (hasIncorrectPredictions) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 9,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 9,
            count: 1,
          });
          logger.info(`Trophée Looser attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Looser réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} a correctement prédit un score exact cette semaine.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Looser:", error);
    throw error;
  }
};

/**
 * Checks if a user has maintained the top ranking position for the entire month and assigns the Invincible Trophy if so.
 *
 * @param {string} userId - The ID of the user to check.
 * @param {Date} startDate - The start date of the month to check.
 * @param {Date} endDate - The end date of the month to check.
 * @return {Promise<void>} - A Promise that resolves when the function completes.
 * @throws {Error} - If there is an error during the verification process.
 */
const checkInvincibleTrophy = async () => {
  try {
    const reward = await getRewardById(10);
    if (reward.active === false) {
      logger.info("Trophee Invincible non actif");
      return;
    }
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const users = await User.findAll();

    for (const user of users) {
      const userIsInvincible = await getUserTopRankingStatus(user.id, firstDayOfMonth, lastDayOfMonth);

      if (userIsInvincible) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 10,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 10,
            count: 1,
          });
          logger.info(`Trophée L'Invincible attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée L'Invincible réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas conservé la première place pendant tout le mois.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'Invincible:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has achieved the "Fragile Trophy" for the current month.
 * If a user has achieved the trophy, it creates or updates their UserReward entry in the database.
 *
 * @return {Promise<void>} Resolves when all users have been checked and their trophy status updated.
 * @throws {Error} If there is an error retrieving user data or updating the UserReward table.
 */
const checkFragileTrophy = async () => {
  try {
    const reward = await getRewardById(11);
    if (reward.active === false) {
      logger.info("Trophee Fragile non actif");
      return;
    }
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const users = await User.findAll();

    for (const user of users) {
      const userIsFragile = await getUserBottomRankingStatus(user.id, firstDayOfMonth, lastDayOfMonth);

      if (userIsFragile) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 11,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 11,
            count: 1,
          });
          logger.info(`Trophée Le Fragile attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le Fragile réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas conservé la dernière place pendant tout le mois.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Fragile:", error);
    throw error;
  }
};

/**
 * Checks if any user has made no predictions for the current week and assigns the Ghost Trophy if so.
 *
 * @return {Promise<void>} - A Promise that resolves when the function completes.
 * @throws {Error} - If there is an error during the verification process.
 */
const checkGhostTrophy = async () => {
  try {
    const reward = await getRewardById(27);
    if (reward.active === false) {
      logger.info("Trophee Le disparu non actif");
      return;
    }
    const currentWeek = new Date();
    const firstDayOfWeek = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
    const lastDayOfWeek = new Date(currentWeek.setDate(firstDayOfWeek.getDate() + 6));

    const users = await User.findAll();

    for (const user of users) {
      const userMadeNoPredictions = await checkNoPredictionsForWeek(user.id, firstDayOfWeek, lastDayOfWeek);

      if (userMadeNoPredictions) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 27,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 27,
            count: 1,
          });
          logger.info(`Trophée Le disparu attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le disparu réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} a fait des pronostics cette semaine.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le disparu:", error);
    throw error;
  }
};

/**
 * Checks if any user has achieved the Triple Menace trophy for the current week.
 *
 * @return {Promise<void>} - Resolves when the check is complete.
 * @throws {Error} - If there is an error during the check.
 */
const checkTripleMenaceTrophy = async () => {
  try {
    const reward = await getRewardById(28);
    if (reward.active === false) {
      logger.info("Trophee Triple Menace non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const userIsTripleMenace = await checkCorrectMatchFullPrediction(user.id, startOfWeek, endOfWeek);

      if (userIsTripleMenace) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 28,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 28,
            count: 1,
          });
          logger.info(`Trophée Triple Menace attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Triple Menace réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères Triple Menace.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Triple Menace:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has won the "Triple Looser" trophy for the current week.
 * If a user has won the trophy, it creates or updates their UserReward record.
 *
 * @return {Promise<void>} - A Promise that resolves when all checks are complete.
 * @throws {Error} - If there is an error during the process.
 */
const checkTripleLooserTrophy = async () => {
  try {
    const reward = await getRewardById(29);
    if (reward.active === false) {
      logger.info("Trophee Triple Looser non actif");
      return;
    }
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();

    for (const user of users) {
      const userIsTripleLooser = await checkIncorrectMatchFullPrediction(user.id, startOfWeek, endOfWeek);

      if (userIsTripleLooser) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 29,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 29,
            count: 1,
          });
          logger.info(`Trophée Triple Looser attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Triple Looser réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères Triple Looser.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Triple Looser:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has won the "Le casanier" trophy for the current month.
 * If a user has won the trophy, it creates or updates their UserReward record.
 *
 * @return {Promise<void>} - A Promise that resolves when all checks are complete.
 * @throws {Error} - If there is an error during the process.
 */
const checkCasanierTrophy = async () => {
  try {
    const reward = await getRewardById(25);
    if (reward.active === false) {
      logger.info("Trophee Le casanier non actif");
      return;
    }
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const users = await User.findAll();

    for (const user of users) {
      const userIsCasanier = await checkHomeTeamBets(user.id, firstDayOfMonth, lastDayOfMonth);

      if (userIsCasanier) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 25, // ID pour "Le casanier"
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 25,
            count: 1,
          });
          logger.info(`Trophée Le casanier attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le casanier réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères pour Le casanier.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le casanier:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has made away team bets in the current week and if so,
 * assigns them the "Le nomade" trophy. If the user already has the trophy, it increments the count.
 *
 * @return {Promise<void>} - A Promise that resolves when all users have been checked and their trophies updated.
 * @throws {Error} - If there is an error retrieving the users or creating/updating the trophy.
 */
const checkNomadeTrophy = async () => {
  try {
    const reward = await getRewardById(26);
    if (reward.active === false) {
      logger.info("Trophee Le nomade non actif");
      return;
    }
    const currentWeek = new Date();
    const startOfWeek = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
    const endOfWeek = new Date(currentWeek.setDate(startOfWeek.getDate() + 6));

    const users = await User.findAll();

    for (const user of users) {
      const userIsNomade = await checkAwayTeamBets(user.id, startOfWeek, endOfWeek);

      if (userIsNomade) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 26, // ID pour "Le nomade"
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 26,
            count: 1,
          });
          logger.info(`Trophée Le nomade attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le nomade réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères pour Le nomade.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le nomade:", error);
    throw error;
  }
};

/**
 * Checks if any user has made a visionary bet for the current week and awards the Visionary Trophy if they have.
 *
 * @return {Promise<void>} - A promise that resolves when the function has finished executing.
 * @throws {Error} - If there is an error during the execution of the function.
 */
const checkVisionaryTrophy = async () => {
  try {
    const reward = await getRewardById(15);
    if (reward.active === false) {
      logger.info("Trophee Le visionnaire non actif");
      return;
    }
    const currentWeek = new Date();
    const startOfWeek = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
    const endOfWeek = new Date(currentWeek.setDate(startOfWeek.getDate() + 6));

    const users = await User.findAll();

    for (const user of users) {
      const userIsVisionary = await checkVisionaryBet(user.id, startOfWeek, endOfWeek);

      if (userIsVisionary) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 15,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 15,
            count: 1,
          });
          logger.info(`Trophée Le visionnaire attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée Le visionnaire réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères pour Le visionnaire.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le visionnaire:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has made a blind bet for the current week and if so,
 * assigns them the "L'aveugle" trophy. If the user already has the trophy, it increments the count.
 *
 * @return {Promise<void>} - A Promise that resolves when all users have been checked and their trophies updated.
 * @throws {Error} - If there is an error retrieving the users or creating/updating the trophy.
 */
const checkBlindTrophy = async () => {
  try {
    const reward = await getRewardById(16);
    if (reward.active === false) {
      logger.info("Trophee L'aveugle non actif");
      return;
    }
    const currentWeek = getWeekDateRange();
    const users = await User.findAll();

    for (const user of users) {
      const userIsBlind = await checkBlindBet(user.id, currentWeek.start, currentWeek.end);

      if (userIsBlind) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 16,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 16,
            count: 1,
          });
          logger.info(`Trophée L'aveugle attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée L'aveugle réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères pour L'aveugle.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'aveugle:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has predicted an exact score for at least 5 matches within the current season and if so,
 * assigns them the "L'Analyste" trophy. If the user already has the trophy, it increments the count.
 *
 * @return {Promise<void>} - A Promise that resolves when all users have been checked and their trophies updated.
 * @throws {Error} - If there is an error retrieving the users or creating/updating the trophy.
 */
const checkAnalystTrophy = async () => {
  try {
    const reward = await getRewardById(14);
    if (reward.active === false) {
      logger.info("Trophee L'analyste non actif");
      return;
    }
    const currentSeason = await getCurrentSeasonId(61);
    const users = await User.findAll();

    for (const user of users) {
      const exactScoreCount = await getExactScorePredictionsCount(user.id, currentSeason);

      if (exactScoreCount >= 5) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 14,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 14,
            count: 1,
          });
          logger.info(`Trophée "L'Analyste" attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "L'Analyste" réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas rempli les critères pour L'aveugle.`);
      }
    }

  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'Analyste:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has maintained the first place position for two consecutive months.
 * If they have, the "Favorite" trophy is awarded to them.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkFavoriteTrophy = async () => {
  try {
    const reward = await getRewardById(12);
    if (reward.active === false) {
      logger.info("Trophee Favorite non actif");
      return;
    }
    const monthDates = getFirstDaysOfCurrentAndPreviousMonth();
    const users = await User.findAll();

    const currentDate = new Date();
    const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

    if (currentDate < twoMonthsAgo) {
      logger.info("La saison est trop récente pour vérifier le trophée 'Le Favori'.");
      return;
    }

    for (const user of users) {
      const userIsFavorite = await getUserTopRankingForTwoMonths(user.id, monthDates.firstDayCurrentMonth, monthDates.firstDayPreviousMonth);

      if (userIsFavorite) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 12,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 12,
            count: 1,
          });
          logger.info(`Trophée "Le Favori" attribué à l'utilisateur ${user.id}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "Le Favori" réattribué à l'utilisateur ${user.id}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.id} n'a pas conservé la première place pendant deux mois consécutifs.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Favori:", error);
    throw error;
  }
};

/**
 * Checks if each user in the database has maintained the second place position for two consecutive months.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkEternalSecondTrophy = async () => {
  try {
    const reward = await getRewardById(13);
    if (reward.active === false) {
      logger.info("Trophee L'éternel Second non actif");
      return;
    }
    const monthDates = getFirstDaysOfCurrentAndPreviousMonth();
    const users = await User.findAll();

    for (const user of users) {
      const userIsSecond = await getUserSecondPlaceForTwoMonths(user.id, monthDates.firstDayCurrentMonth, monthDates.firstDayPreviousMonth);

      if (userIsSecond) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 13,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 13,
            count: 1,
          });
          logger.info(`Trophée "L'éternel Second" attribué à l'utilisateur ${user.id}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "L'éternel Second" réattribué à l'utilisateur ${user.id}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.id} n'a pas conservé la deuxième place pendant deux mois consécutifs.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'éternel Second:", error);
    throw error;
  }
};

/**
 * Checks if the Golden Hand Trophy should be awarded to the user with the longest correct prediction streak
 * in the current season. If the season has not reached the mid-season, the trophy cannot be awarded.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkGoldenHandTrophy = async () => {
  try {
    const reward = await getRewardById(18);
    if (reward.active === false) {
      logger.info("Trophee La Main en or non actif");
      return;
    }
    const currentSeason = await getCurrentSeasonYear(61);
    const { startDate, endDate } = await getSeasonDates(currentSeason);
    const midSeasonDate = await getMidSeasonDate(currentSeason);

    const currentDate = new Date();
    if (currentDate < midSeasonDate) {
      logger.info("La saison n'a pas encore atteint la mi-saison, le trophée 'La Main en or' ne peut pas être attribué.");
      return;
    }

    const users = await User.findAll();
    let topUserId = null;
    let topStreak = 0;

    for (const user of users) {
      const longestStreak = await getLongestCorrectPredictionStreak(user.id, startDate, endDate);

      if (longestStreak > topStreak) {
        topStreak = longestStreak;
        topUserId = user.id;
      }
    }

    if (topUserId) {
      const existingReward = await UserReward.findOne({
        where: {
          user_id: topUserId,
          reward_id: 18,
        },
      });

      if (!existingReward) {
        await UserReward.create({
          user_id: topUserId,
          reward_id: 18,
          count: 1,
        });
        logger.info(`Trophée "La Main en or" attribué à l'utilisateur ${topUserId}`);
      } else {
        existingReward.count += 1;
        await existingReward.save();
        logger.info(`Trophée "La Main en or" réattribué à l'utilisateur ${topUserId}`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée La Main en or:", error);
    throw error;
  }
};

/**
 * Checks if the Cold Hand Trophy should be awarded to the user with the longest incorrect prediction streak
 * in the current month. If the current month has not ended, the trophy cannot be awarded.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkColdHandTrophy = async () => {
  try {
    const reward = await getRewardById(19);
    if (reward.active === false) {
      logger.info("Trophee La Main en fer non actif");
      return;
    }
    const currentSeason = await getCurrentSeasonYear(61);
    const monthDates = getStartAndEndOfCurrentMonth();

    const currentDate = new Date();
    if (currentDate < monthDates.endOfMonth) {
      logger.info("La saison n'a pas encore atteint la fin du mois, le trophée 'La Main en or' ne peut pas être attribué.");
      return;
    }

    const users = await User.findAll();

    let topUserId = null;
    let topStreak = 0;

    for (const user of users) {
      const longestStreak = await getLongestIncorrectPredictionStreak(user.id, monthDates.startOfMonth, monthDates.endOfMonth);

      if (longestStreak > topStreak) {
        topStreak = longestStreak;
        topUserId = user.id;
      }
    }

    if (topUserId) {
      const existingReward = await UserReward.findOne({
        where: {
          user_id: topUserId,
          reward_id: 19,
        },
      });

      if (!existingReward) {
        await UserReward.create({
          user_id: topUserId,
          reward_id: 19,
          count: 1,
        });
        logger.info(`Trophée "La Main Froide" attribué à l'utilisateur ${topUserId}`);
      } else {
        existingReward.count += 1;
        await existingReward.save();
        logger.info(`Trophée "La Main Froide" réattribué à l'utilisateur ${topUserId}`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée La Main Froide:", error);
    throw error;
  }
};

/**
 * Checks if the Heart Expert Trophy should be awarded to each user who has made at least 10 correct predictions for their favorite team.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkHeartExpertTrophy = async () => {
  try {
    const reward = await getRewardById(22);
    if (reward.active === false) {
      logger.info("Trophee L'Expert du cœur non actif");
      return;
    }
    const users = await User.findAll();

    for (const user of users) {
      const favoriteTeamId = user.team_id;

      if (!favoriteTeamId) {
        logger.info(`L'utilisateur ${user.id} n'a pas d'équipe favorite définie.`);
        continue;
      }

      const correctPredictionsCount = await getCorrectPredictionsForFavoriteTeam(user.id, favoriteTeamId);

      if (correctPredictionsCount >= 10) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 22,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 22,
            count: 1,
          });
          logger.info(`Trophée "L'Expert du cœur" attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "L'Expert du cœur" réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas encore atteint 10 pronostics corrects pour son équipe favorite.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée L'Expert du cœur:", error);
    throw error;
  }
};

/**
 * Checks if each user has predicted at least 10 victories for their favorite team.
 * If they have, assigns or increments the "Le fanatique" trophy.
 *
 * @return {Promise<void>} - Resolves when all users have been checked.
 * @throws {Error} - If there is an error during the process.
 */
const checkFanaticTrophy = async () => {
  try {
    const reward = await getRewardById(23);
    if (reward.active === false) {
      logger.info("Trophee Le fanatique non actif");
      return;
    }
    const users = await User.findAll();

    for (const user of users) {
      const favoriteTeamId = user.team_id;

      if (!favoriteTeamId) {
        logger.info(`L'utilisateur ${user.id} n'a pas d'équipe favorite définie.`);
        continue;
      }

      const predictedVictoriesCount = await getPredictedVictoriesForFavoriteTeam(user.id, favoriteTeamId);

      if (predictedVictoriesCount >= 10) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 23,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 23,
            count: 1,
          });
          logger.info(`Trophée "Le fanatique" attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "Le fanatique" réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas encore prédit des victoires pour son équipe favorite 10 fois.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le fanatique:", error);
    throw error;
  }
};

/**
 * Checks if each user has predicted at least 5 correct scorers in 5 matches for the current season.
 * If they have, assigns or increments the "Goal Detective" trophy.
 *
 * @return {Promise<void>} - Resolves when all users have been checked.
 * @throws {Error} - If there is an error during the process.
 */
const checkGoalDetectiveTrophy = async () => {
  try {
    const reward = await getRewardById(24);
    if (reward.active === false) {
      logger.info("Trophee Détective du Butteur non actif");
      return;
    }
    const currentSeason = await getCurrentSeasonYear(61);
    const users = await User.findAll();

    for (const user of users) {
      const correctScorerCount = await getCorrectScorerPredictionsCount(user.id, currentSeason);

      if (correctScorerCount >= 5) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 24,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 24,
            count: 1,
          });
          logger.info(`Trophée "Détective du Butteur" attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "Détective du Butteur" réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas encore deviné correctement le butteur dans 5 matchs.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Détective du Butteur:", error);
    throw error;
  }
};

/**
 * Checks if each user has collected more than 20 unique trophies. If they have, assigns or increments the "Collector" trophy.
 *
 * @return {Promise<void>} - Resolves when all users have been checked.
 * @throws {Error} - If there is an error during the process.
 */
const checkCollectorTrophy = async () => {
  try {
    const reward = await getRewardById(32);
    if (reward.active === false) {
      logger.info("Trophee Collecteur non actif");
      return;
    }
    const users = await User.findAll();

    for (const user of users) {
      const uniqueTrophiesCount = await getUniqueTrophiesCount(user.id);

      if (uniqueTrophiesCount > 20) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: user.id,
            reward_id: 32,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: 32,
            count: 1,
          });
          logger.info(`Trophée "Le Collectionneur" attribué à l'utilisateur ${user.username}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "Le Collectionneur" réattribué à l'utilisateur ${user.username}`);
        }
      } else {
        logger.info(`L'utilisateur ${user.username} n'a pas encore collecté plus de 20 trophées.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Collectionneur:", error);
    throw error;
  }
};

/**
 * Checks if the King Steps Trophy should be awarded to the user with the highest total points in the current season.
 * If the season has not ended, the trophy cannot be awarded.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkKingStepsTrophy = async () => {
  try {
    const reward = await getRewardById(33);
    if (reward.active === false) {
      logger.info("Trophee Le Roi Steps non actif");
      return;
    }
    const currentSeason = await getCurrentSeasonYear(61);
    const seasonDates = await getSeasonDates(currentSeason);
    const currentDate = new Date();

    if (currentDate < seasonDates.endDate) {
      logger.info("La saison n'est pas encore terminée. Le trophée 'Le Roi Steps' ne peut pas être attribué.");
      return;
    }

    const users = await User.findAll();

    let topUserId = null;
    let topPoints = 0;

    for (const user of users) {
      const totalPoints = await getTotalPointsForSeason(user.id, currentSeason);

      if (totalPoints > topPoints) {
        topPoints = totalPoints;
        topUserId = user.id;
      }
    }

    if (topUserId) {
      const existingReward = await UserReward.findOne({
        where: {
          user_id: topUserId,
          reward_id: 33,
        },
      });

      if (!existingReward) {
        await UserReward.create({
          user_id: topUserId,
          reward_id: 33,
          count: 1,
        });
        logger.info(`Trophée "Le Roi Steps" attribué à l'utilisateur ${topUserId}`);
      } else {
        existingReward.count += 1;
        await existingReward.save();
        logger.info(`Trophée "Le Roi Steps" réattribué à l'utilisateur ${topUserId}`);
      }
    } else {
      logger.info("Aucun utilisateur n'a encore accumulé des points.");
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Roi Steps:", error);
    throw error;
  }
};

/**
 * Checks if the Jester Trophy should be awarded to the user with the second highest total points in the current season.
 * If the season has not ended, the trophy cannot be awarded.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkJesterTrophy = async () => {
  try {
    const reward = await getRewardById(34);
    if (reward.active === false) {
      logger.info("Trophee Jester non actif");
      return;
    }
    const currentSeason = await getCurrentSeason();

    const currentDate = new Date();
    if (currentDate < new Date(currentSeason.end_date)) {
      logger.info("La saison n'est pas encore terminée. Le trophée 'Le Bouffon' ne peut pas être attribué.");
      return;
    }

    const users = await User.findAll();
    let topUserId = null;
    let secondUserId = null;
    let topPoints = 0;
    let secondPoints = 0;

    for (const user of users) {
      const totalPoints = await getTotalPointsForSeason(user.id, currentSeason.id);

      if (totalPoints > topPoints) {
        secondPoints = topPoints;
        secondUserId = topUserId;

        topPoints = totalPoints;
        topUserId = user.id;
      } else if (totalPoints > secondPoints) {
        secondPoints = totalPoints;
        secondUserId = user.id;
      }
    }

    if (secondUserId) {
      const existingReward = await UserReward.findOne({
        where: {
          user_id: secondUserId,
          reward_id: 34,
        },
      });

      if (!existingReward) {
        await UserReward.create({
          user_id: secondUserId,
          reward_id: 34,
          count: 1,
        });
        logger.info(`Trophée "Le Bouffon" attribué à l'utilisateur ${secondUserId}`);
      } else {
        existingReward.count += 1;
        await existingReward.save();
        logger.info(`Trophée "Le Bouffon" réattribué à l'utilisateur ${secondUserId}`);
      }
    } else {
      logger.info("Aucun utilisateur n'a terminé en deuxième position cette saison.");
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Bouffon:", error);
    throw error;
  }
};

/**
 * Checks if the Legendary Step Trophy should be awarded to the user with the highest total points in the current season.
 * If the season has not ended, the trophy cannot be awarded.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkLegendaryStepTrophy = async () => {
  try {
    const reward = await getRewardById(35);
    if (reward.active === false) {
      logger.info("Trophee Legendary Step non actif");
      return;
    }
    const currentSeason = await getCurrentSeason();

    const currentDate = new Date();
    if (currentDate < new Date(currentSeason.end_date)) {
      logger.info("La saison n'est pas encore terminée. Le trophée 'Le step légendaire' ne peut pas être attribué.");
      return;
    }

    const currentSeasonWinnerId = await getSeasonWinner(currentSeason.id);

    if (currentSeasonWinnerId) {
      const userWonPreviousSeason = await hasUserWonPreviousSeason(currentSeasonWinnerId, currentSeason.start_date);

      if (userWonPreviousSeason) {
        const existingReward = await UserReward.findOne({
          where: {
            user_id: currentSeasonWinnerId,
            reward_id: 35,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: currentSeasonWinnerId,
            reward_id: 35,
            count: 1,
          });
          logger.info(`Trophée "Le step légendaire" attribué à l'utilisateur ${currentSeasonWinnerId}`);
        } else {
          existingReward.count += 1;
          await existingReward.save();
          logger.info(`Trophée "Le step légendaire" réattribué à l'utilisateur ${currentSeasonWinnerId}`);
        }
      } else {
        logger.info(`L'utilisateur ${currentSeasonWinnerId} n'a pas gagné la saison précédente, donc pas de trophée.`);
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le step légendaire:", error);
    throw error;
  }
};

/**
 * Checks if any users have reached milestone trophy points for the current season and awards them the corresponding trophy if they haven't already received it.
 *
 * @return {Promise<void>} Resolves when the function completes.
 * @throws {Error} If there is an error during the verification process.
 */
const checkMilestoneTrophies = async () => {
  const pointMilestones = [
    { points: 100, rewardId: 36 },
    { points: 150, rewardId: 37 },
    { points: 175, rewardId: 38 },
    { points: 200, rewardId: 39 },
    { points: 225, rewardId: 40 },
    { points: 250, rewardId: 41 },
  ];

  try {
    const currentSeason = await getCurrentSeason();
    const users = await User.findAll();

    for (const user of users) {
      const userPoints = await getUserPointsForSeason(user.id, currentSeason.id);

      for (const milestone of pointMilestones) {
        if (userPoints >= milestone.points) {
          const existingReward = await UserReward.findOne({
            where: {
              user_id: user.id,
              reward_id: milestone.rewardId,
            },
          });

          if (!existingReward) {
            await UserReward.create({
              user_id: user.id,
              reward_id: milestone.rewardId,
              count: 1,
            });
            logger.info(`Trophée pour ${milestone.points} points attribué à l'utilisateur ${user.username}`);
          } else {
            logger.info(`L'utilisateur ${user.username} a déjà le trophée pour les ${milestone.points} points.`);
          }
        } else {
          logger.info(`L'utilisateur ${user.username} n'a pas atteint un nombre de points suffisant pour le trophée: ${milestone.points} points.`);
        }
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification des trophées par paliers de points:", error);
    throw error;
  }
};

module.exports = {
  getAllRewards,
  getUserRewards,
  createReward,
  updateReward,
  deleteReward,
  toggleActivation,
  assignReward,
  removeReward,
  checkPhoenixTrophy,
  checkRisingStarTrophy,
  checkMassacreTrophy,
  checkKhalassTrophy,
  checkChallengerTrophy,
  checkOracleTrophy,
  checkBlackCatTrophy,
  checkZeroGuardianTrophy,
  checkJackpotTrophy,
  checkLooserTrophy,
  checkInvincibleTrophy,
  checkFragileTrophy,
  checkGhostTrophy,
  checkTripleMenaceTrophy,
  checkTripleLooserTrophy,
  checkCasanierTrophy,
  checkNomadeTrophy,
  checkVisionaryTrophy,
  checkBlindTrophy,
  checkAnalystTrophy,
  checkFavoriteTrophy,
  checkEternalSecondTrophy,
  checkGoldenHandTrophy, // non programmé
  checkColdHandTrophy, // non programmé
  checkHeartExpertTrophy,
  checkFanaticTrophy,
  checkGoalDetectiveTrophy,
  checkCollectorTrophy,
  checkKingStepsTrophy,
  checkJesterTrophy,
  checkLegendaryStepTrophy,
  checkMilestoneTrophies
};
