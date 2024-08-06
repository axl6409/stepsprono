const { User, Reward, UserReward } = require('../models');
const path = require('path');
const {deleteFile} = require("../utils/utils");
const logger = require("../utils/logger/logger");
const {getUserRank} = require("./userService");

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
            reward_id: Reward.id,
          },
        });

        if (!existingReward) {
          await UserReward.create({
            user_id: user.id,
            reward_id: Reward.id,
            count: 1,
          });

          logger.info(`Trophée Le Phénix attribué à l'utilisateur ${user.username}`);
        }
      }
    }
  } catch (error) {
    logger.error("Erreur lors de la vérification du trophée Le Phénix:", error);
  }
};

module.exports = {
  getAllRewards,
  getUserRewards,
  createReward,
  updateReward,
  deleteReward,
  toggleActivation,
  checkPhoenixTrophy
};
