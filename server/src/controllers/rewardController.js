// server/src/controllers/rewardController.js
const rewardService = require('../services/rewardService');
const logger = require("../utils/logger/logger");
const { Reward } = require("../models");

/**
 * Retrieves all rewards and sends them as a JSON response.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} JSON response with all rewards
 */
exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await rewardService.allRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
    logger.error('Erreur lors de la recuperation des trophées:', error)
  }
};

/**
 * Retrieves all user rewards for a specific user and sends them as a JSON response.
 *
 * @param {Object} req - The request object containing the user ID
 * @param {Object} res - The response object
 * @return {Promise} JSON response with user rewards
 */
exports.getAllUserRewards = async (req, res) => {
  try {
    const userId = req.params.userId;
    const rewards = await rewardService.getRewardsByUser(userId);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Route protégée', error: error.message })
    logger.error('Erreur lors de la recuperation des trophées utilisateur:', error)
  }
};

/**
 * Check the match rewards by verifying the match and bet, then send a success message or error message.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} JSON response with success message or error message
 */
exports.checkMatchRewards = async (req, res) => {
  try {
    await rewardService.checkMatchRewards(req.body.match, req.body.bet);
    res.status(200).json({ message: 'Récompenses vérifiées avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification des récompenses de match', error: error.message })
    logger.error('checkMatchRewards ERROR:', error);
  }
};

/**
 * Check the daily rewards by invoking the checkDailyRewards service function and handle success and error responses.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} JSON response with success message or error message
 */
exports.checkDailyRewards = async (req, res) => {
  try {
    await rewardService.checkDailyRewards();
    res.status(200).json({ message: 'Récompenses journalières vérifiées avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification des récompenses journalières', error: error.message })
    logger.error('checkDailyRewards ERROR:', error);
  }
};

/**
 * Check the weekly champion by invoking the checkWeeklyChampion service function and handle success and error responses.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} JSON response with success message or error message
 */
exports.checkWeeklyChampion = async (req, res) => {
  try {
    await rewardService.checkWeeklyChampion();
    res.status(200).json({ message: 'Champion hebdomadaire vérifié avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification du champion hebdomadaire', error: error.message })
    logger.error('checkWeeklyChampion ERROR:', error);
  }
};

/**
 * Check the monthly rewards by invoking the checkMonthlyRewards service function and handle success and error responses.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} JSON response with success message or error message
 */
exports.checkMonthlyRewards = async (req, res) => {
  try {
    await rewardService.checkMonthlyRewards();
    res.status(200).json({ message: 'Récompenses mensuelles vérifiées avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification des récompenses mensuelles', error: error.message })
    logger.error('checkMonthlyRewards ERROR:', error);
  }
};

/**
 * Check the season rewards by invoking the checkSeasonRewards service function and handle success and error responses.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise} JSON response with success message or error message
 */
exports.checkSeasonRewards = async (req, res) => {
  try {
    await rewardService.checkSeasonRewards();
    res.status(200).json({ message: 'Récompenses de saison vérifiées avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification des récompenses de saison', error: error.message })
    logger.error('checkSeasonRewards ERROR:', error);
  }
};
