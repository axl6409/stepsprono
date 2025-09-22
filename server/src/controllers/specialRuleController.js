const express = require('express')
const router = express.Router()
const { authenticateJWT, checkAdmin, checkManager, checkManagerTreasurer} = require("../middlewares/auth");
const { SpecialRule, SpecialRuleResult } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger/logger");
const { toggleSpecialRule, getCurrentSpecialRule, configSpecialRule, checkSpecialRule} = require("../services/specialRuleService");

router.get('/special-rules', authenticateJWT, async (req, res) => {
  try {
    const rules = await SpecialRule.findAll({
      include: [
        {
          model: SpecialRuleResult,
          as: 'results'
        }
      ]
    });
    res.json(rules);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des règles', error: error.message });
  }
})

router.get('/special-rule/datas/:id', authenticateJWT, async (req, res) => {
  try {
    const rule = await SpecialRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Règle non trouvée' });
    res.json(rule);
  } catch (error) {
    logger.error(error);
  }
})

router.get('/special-rule/matchday/:matchday', authenticateJWT, async (req, res) => {
  
})

router.get('/admin/special-rule/check/:id', authenticateJWT, checkAdmin, async (req, res) => {
  try {
    const ruleId = req.params.id;
    const rule = await SpecialRule.findByPk(ruleId);
    if (!rule) return res.status(404).json({ message: 'Règle non trouvée' });
    const check = await checkSpecialRule(rule.rule_key);
    res.json(check);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Erreur lors de la vérification de la règle', error: error.message });
  }
})

router.get('/special-rule/current', authenticateJWT, async (req, res) => {
  try {
    const rule = await getCurrentSpecialRule();
    if (!rule || !rule.status) {
      return res.status(204).json({ message: 'Aucune règle active cette semaine' });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la règle', error: error.message });
    logger.error(error);
  }
})

router.patch('/admin/special-rule/datas/:id', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    const ruleId = req.params.id;
    const payload = req.body;
    const rule = await configSpecialRule(ruleId, payload);
    if (!rule) {
      return res.status(204).json({ message: 'Aucune règle trouvée' });
    }
    res.json(rule);
  } catch (error) {
    logger.error(error);
  }
})

router.patch('/admin/special-rule/toggle/:id', authenticateJWT, checkManagerTreasurer, async (req, res) => {
  try {
    logger.info('Special Rules')
    const ruleId = req.params.id;
    let status = req.body.status;
    const rule = await toggleSpecialRule(ruleId, status)
    if (!rule) return res.status(404).json({ message: 'Règle non trouvée' });
    res.json(rule);
  } catch (error) {
    logger.error(error);
  }
})

module.exports = router