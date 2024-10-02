const express = require('express')
const app = express()
const router = express.Router()
const moment = require('moment-timezone')
moment.tz.setDefault("Europe/Paris")
const appController = require("../controllers/appController")
const authController = require("../controllers/authController")
const betController = require("../controllers/betController")
const competitionController = require("../controllers/competitionController")
const matchController = require("../controllers/matchController")
const playerController = require("../controllers/playerController")
const rewardController = require("../controllers/rewardController")
const seasonController = require("../controllers/seasonController")
const teamController = require("../controllers/teamController")
const userController = require("../controllers/userController")
const eventController = require("../controllers/eventController")
const {subscribe} = require("../controllers/notificationController");

router.use(appController)
router.use(authController)
router.use(betController)
router.use(competitionController)
router.use(matchController)
router.use(playerController)
router.use(rewardController)
router.use(seasonController)
router.use(teamController)
router.use(userController)
router.use(eventController)

router.post('/notifications/subscribe', subscribe);

module.exports = router;