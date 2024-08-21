const { User, Match, Reward, UserReward } = require('../models');
const path = require('path');
const {deleteFile} = require("../utils/utils");
const logger = require("../utils/logger/logger");
const {getUserRank, getUserPointsForWeek, getUserRankByPeriod, checkUserCorrectPredictions,
  checkUserIncorrectPredictions, checkUserZeroPredictions, checkExactScorePredictions, checkIncorrectScorePredictions,
  getUserTopRankingStatus, getUserBottomRankingStatus, checkNoPredictionsForWeek, checkCorrectMatchFullPrediction
} = require("./userService");

const getAllRewards = async () => {
  return await Reward.findAll();
};

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

const toggleActivation = async (id, active) => {
  const reward = await Reward.findByPk(id);
  if (!reward) throw new Error('Reward not found');
  reward.active = active;
  await reward.save();
  return reward;
};

const assignReward = async (data) => {
  try {
    const { user_id, reward_id, count } = data;
    const existingReward = await UserReward.findOne({
      where: {
        user_id: user_id,
        reward_id: reward_id,
      },
    });
    if (!existingReward) {
      await UserReward.create({
        user_id,
        reward_id,
        count
      });
      logger.info(`Trophée Massacre ! attribué à l'utilisateur ${topUser.username}`);
    } else {
      existingReward.count += 1;
      await existingReward.save();
      logger.info(`Trophée Massacre ! réattribué à l'utilisateur ${topUser.username}`);
    }
  } catch (error) {
    logger.warn("Error assigning reward => ", error);
    throw error;
  }
};

const checkSeasonRewards = async () => {

}

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
    const startOfSeason = new Date();
    startOfSeason.setMonth(startOfSeason.getMonth() - 1);

    const endOfFirstMonth = new Date();
    endOfFirstMonth.setMonth(startOfSeason.getMonth() + 1);

    const users = await User.findAll();

    for (const user of users) {
      const rankAtEndOfFirstMonth = await getUserRank(user.id, endOfFirstMonth);

      if (rankAtEndOfFirstMonth <= 3) {
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
          logger.info(`Trophée L'Étoile Montante attribuite à l'utilisateur ${user.username}`);
        }
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
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();
    let topUsers = [];
    let maxPoints = 0;

    for (const user of users) {
      const userPoints = await getUserPointsForWeek(user.id, startOfWeek, endOfWeek);

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
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const users = await User.findAll();
    let bottomUsers = [];
    let minPoints = Infinity;

    for (const user of users) {
      const userPoints = await getUserPointsForWeek(user.id, startOfWeek, endOfWeek);

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

const checkTripleMenaceTrophy = async () => {
  try {
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

module.exports = {
  getAllRewards,
  getUserRewards,
  createReward,
  updateReward,
  deleteReward,
  toggleActivation,
  assignReward,
  checkSeasonRewards,
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
  checkTripleMenaceTrophy
};
