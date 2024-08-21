const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middlewares/auth');
const { getAllRewards, assignReward, toggleActivation, deleteReward, updateReward, createReward, getUserRewards,
  removeReward
} = require('../services/rewardService');
const { upload } = require('../utils/utils');

router.get('/rewards', authenticateJWT, async (req, res) => {
  try {
    const rewards = await getAllRewards();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des trophées', error: error.message });
  }
});
router.get('/rewards/user/:id', authenticateJWT, async (req, res) => {
  try {
    const rewards = await getUserRewards(req.params.id);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la sélection des trophées', error: error.message });
  }
})
router.post('/rewards', authenticateJWT, upload.single('image'), async (req, res) => {
  req.body.type = 'trophy';
  try {
    const reward = await createReward(req.body, req.file);
    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du trophée', error: error.message });
  }
});
router.put('/rewards/:id', authenticateJWT, upload.single('image'), async (req, res) => {
  req.body.type = 'trophy';
  try {
    const reward = await updateReward(req.params.id, req.body, req.file);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du trophée', error: error.message });
  }
});
router.delete('/rewards/:id', authenticateJWT, async (req, res) => {
  try {
    await deleteReward(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du trophée', error: error.message });
  }
});
router.put('/rewards/:id/activate', authenticateJWT, async (req, res) => {
  try {
    const reward = await toggleActivation(req.params.id, req.body.active);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du trophée', error: error.message });
  }
});
router.post('/admin/rewards/attribute', authenticateJWT, async (req, res) => {
  try {
    const reward = await assignReward(req.body);
    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'attribution du trophée', error: error.message });
  }
});
router.post('/admin/rewards/remove', authenticateJWT, async (req, res) => {
  try {
    const reward = await removeReward(req.body);
    res.status(200).json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du retrait du trophée', error: error.message });
  }
});

module.exports = router;
