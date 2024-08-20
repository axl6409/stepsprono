const { User, Reward, UserReward } = require('../models');
const path = require('path');
const {deleteFile} = require("../utils/utils");
const logger = require("../utils/logger/logger");
const {getUserRank, getUserPointsForWeek} = require("./userService");

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

// **************************
// Trophies attribution Logic
// **************************
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

module.exports = {
  getAllRewards,
  getUserRewards,
  createReward,
  updateReward,
  deleteReward,
  toggleActivation,
  assignReward,
  checkPhoenixTrophy,
  checkRisingStarTrophy,
  checkMassacreTrophy,
  checkKhalassTrophy,
};
