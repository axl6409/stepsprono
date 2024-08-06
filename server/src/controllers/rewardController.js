const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth');
const rewardService = require('../services/rewardService');
const { upload } = require('../utils/utils');

router.get('/rewards', authenticateJWT, async (req, res) => {
  try {
    const rewards = await rewardService.getAllRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des trophées', error: error.message });
  }
});
router.get('/rewards/user/:id', authenticateJWT, async (req, res) => {
  try {
    const rewards = await rewardService.getUserRewards(req.params.id);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la sélection des trophées', error: error.message });
  }
})
router.post('/rewards', authenticateJWT, upload.single('image'), async (req, res) => {
  req.body.type = 'trophy';
  try {
    const reward = await rewardService.createReward(req.body, req.file);
    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du trophée', error: error.message });
  }
});
router.put('/rewards/:id', authenticateJWT, upload.single('image'), async (req, res) => {
  req.body.type = 'trophy';
  try {
    const reward = await rewardService.updateReward(req.params.id, req.body, req.file);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du trophée', error: error.message });
  }
});
router.delete('/rewards/:id', authenticateJWT, async (req, res) => {
  try {
    await rewardService.deleteReward(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du trophée', error: error.message });
  }
});
router.put('/rewards/:id/activate', authenticateJWT, async (req, res) => {
  try {
    const reward = await rewardService.toggleActivation(req.params.id, req.body.active);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du trophée', error: error.message });
  }
});

module.exports = router;
