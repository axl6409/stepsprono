const axios = require("axios");
const logger = require("../utils/logger/logger");
const { User, Team } = require("../models");
const apiKey = process.env.FB_API_KEY;
const apiHost = process.env.FB_API_HOST;
const apiBaseUrl = process.env.FB_API_URL;
const { downloadImage } = require('../services/imageService');

const createUser = async () => {

}

const updateUser = async () => {

}

const deleteUser = async () => {

}

module.exports = {
  createUser,
  updateUser,
  deleteUser
};