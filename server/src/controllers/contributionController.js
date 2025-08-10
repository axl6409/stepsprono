const express = require('express');
const router = express.Router();
const { authenticateJWT, checkAdmin, checkTreasurer} = require('../middlewares/auth');
const {getContributionsByUsers, deleteUserContribution, addUserContribution, validateUserContribution,
  refuseUserContribution
} = require("../services/contributionService");

router.get('/contributions', authenticateJWT, async (req, res) => {
  try {
    const contributions = await getContributionsByUsers();
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.delete('/contribution/delete', authenticateJWT, checkTreasurer, async (req, res) => {
  try {
    const {contributionId, userId} = req.body;
    const contribution = await deleteUserContribution(contributionId, userId);
    if (!contribution) return res.status(404).json({ error: 'Contribution non trouvée' });
    res.json({ message: 'Contribution supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la contribution', message: error.message });
  }
})

router.post('/contribution/new/:userId', authenticateJWT, checkTreasurer, async (req, res) => {
  try {
    const userId = req.params.userId;
    const matchday = req.body.matchday;
    const amount = req.body.amount;
    const contribution = await addUserContribution(userId, matchday, amount);
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.patch('/contribution/received', authenticateJWT, checkTreasurer, async (req, res) => {
  try {
    const { id, userId } = req.body;
    const contribution = await validateUserContribution(id, userId);
    if (!contribution) return res.status(404).json({ error: 'Contribution non trouvée' });
    res.json({ message: 'Contribution acceptée !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la contribution', message: error.message });
  }
})

router.patch('/contribution/pending', authenticateJWT, checkTreasurer, async (req, res) => {
  try {
    const { id, userId } = req.body;
    const contribution = await refuseUserContribution(id, userId);
    if (!contribution) return res.status(404).json({ error: 'Contribution non trouvée' });
    res.json({ message: 'Contribution en attente !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la contribution', message: error.message });
  }
})

module.exports = router;
