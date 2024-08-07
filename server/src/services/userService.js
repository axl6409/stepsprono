const axios = require("axios");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const logger = require("../utils/logger/logger");
const { Op, fn, col, literal } = require('sequelize');
const { User, Bet } = require("../models");
const schedule = require('node-schedule');
const bcrypt = require('bcrypt');

const getUserRank = async (userId, date) => {
    try {
        const pointsAtDate = await Bet.findAll({
            where: {
                createdAt: {
                    [Op.lte]: date,
                },
            },
            attributes: ['user_id', [fn('SUM', col('points')), 'points']],
            group: ['user_id'],
            order: [[literal('points'), 'DESC']],
        });

        const rankedUsers = pointsAtDate.map((entry) => entry.user_id);
        const userRank = rankedUsers.indexOf(userId) + 1;
        return userRank;
    } catch (error) {
        console.error("Erreur lors de la récupération du classement:", error);
        throw error;
    }
};

module.exports = {
    getUserRank
}