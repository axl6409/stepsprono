const express = require('express')
const {authenticateJWT, checkAdmin} = require("../middlewares/auth");
const {autoContribution} = require("../services/contributionService");
const router = express.Router()

/* ADMIN - POST */
router.post('/admin/events/test', authenticateJWT, checkAdmin, async (req, res) => {
  try {
    const test = ""
    res.send({test});
  } catch (e) {
    res.status(500).json({ message: 'Route protégée', error: e.message })
  }
});

module.exports = router