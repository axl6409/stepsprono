const { Reward } = require('../models');
const path = require('path');
const {deleteFile} = require("../utils/utils");
const logger = require("../utils/logger/logger");

const getAllRewards = async () => {
  return await Reward.findAll();
};

const createReward = async (data, file) => {
  try {
    const { name, description, rank } = data;
    const reward = await Reward.create({
      name,
      description,
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

  const { name, description, rank } = data;
  reward.name = name;
  reward.description = description;
  reward.rank = rank;
  if (file) reward.image = file.filename;

  await reward.save();
  return reward;
};

const deleteReward = async (id) => {
  try {
    const reward = await Reward.findByPk(id);
    if (!reward) throw new Error('Reward not found');
    const imagePath = path.join(__dirname, '../../../client/src/assets/uploads/trophies', reward.image);
    await reward.destroy();
    if (reward.image) deleteFile(imagePath);
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

module.exports = {
  getAllRewards,
  createReward,
  updateReward,
  deleteReward,
  toggleActivation
};
