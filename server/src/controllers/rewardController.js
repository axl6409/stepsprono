const express = require('express');
const router = express.Router();
const { authenticateJWT, checkAdmin} = require('../middlewares/auth');
const { getAllRewards, assignReward, toggleActivation, deleteReward, updateReward, createReward, getUserRewards,
  removeReward, checkMassacreTrophy, checkKhalassTrophy, checkChallengerTrophy, checkOracleTrophy, checkBlackCatTrophy,
  checkZeroGuardianTrophy, checkJackpotTrophy, checkLooserTrophy, checkInvincibleTrophy, checkFragileTrophy,
  checkGhostTrophy, checkTripleMenaceTrophy, checkTripleLooserTrophy, checkCasanierTrophy, checkNomadeTrophy,
  checkVisionaryTrophy, checkBlindTrophy, checkAnalystTrophy, checkFavoriteTrophy, checkEternalSecondTrophy,
  checkGoldenHandTrophy, checkColdHandTrophy, checkHeartExpertTrophy, checkFanaticTrophy, checkGoalDetectiveTrophy,
  checkCollectorTrophy, checkKingStepsTrophy, checkJesterTrophy, checkLegendaryStepTrophy, checkMilestoneTrophies,
  checkPhoenixTrophy, checkRisingStarTrophy
} = require('../services/rewardService');
const { upload } = require('../utils/utils');
const {getCurrentSeasonId} = require("../services/seasonService");

/* PUBLIC - GET */
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
    let seasonId = req.query.seasonId;
    if (!seasonId) {
      seasonId = await getCurrentSeasonId(61);
    }
    const rewards = await getUserRewards(req.params.id, seasonId);
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la sélection des trophées', error: error.message });
  }
})

/* ADMIN - POST */
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
router.post('/admin/rewards', authenticateJWT, upload.single('image'), async (req, res) => {
  req.body.type = 'trophy';
  try {
    const reward = await createReward(req.body, req.file);
    res.status(201).json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du trophée', error: error.message });
  }
});
router.post('/admin/rewards/events/:eventName', authenticateJWT, checkAdmin, async (req, res) => {
  try {
    const eventName = req.params.eventName;

    const eventMap = {
      'phoenix': checkPhoenixTrophy,
      'risingstar': checkRisingStarTrophy,
      'massacre': checkMassacreTrophy,
      'khalass': checkKhalassTrophy,
      'challenger': checkChallengerTrophy,
      'oracle': checkOracleTrophy,
      'blackcat': checkBlackCatTrophy,
      'zeroguardian': checkZeroGuardianTrophy,
      'jackpot': checkJackpotTrophy,
      'looser': checkLooserTrophy,
      'invincible': checkInvincibleTrophy,
      'fragile': checkFragileTrophy,
      'ghost': checkGhostTrophy,
      'triplemenace': checkTripleMenaceTrophy,
      'triplelooser': checkTripleLooserTrophy,
      'casanier': checkCasanierTrophy,
      'nomade': checkNomadeTrophy,
      'visionary': checkVisionaryTrophy,
      'blind': checkBlindTrophy,
      'analyst': checkAnalystTrophy,
      'favorite': checkFavoriteTrophy,
      'eternalsecond': checkEternalSecondTrophy,
      'goldenhand': checkGoldenHandTrophy,
      'coldhand': checkColdHandTrophy,
      'heartexpert': checkHeartExpertTrophy,
      'fanatic': checkFanaticTrophy,
      'goaldetective': checkGoalDetectiveTrophy,
      'collector': checkCollectorTrophy,
      'kingsteps': checkKingStepsTrophy,
      'jester': checkJesterTrophy,
      'legendarystep': checkLegendaryStepTrophy,
      'milestone': checkMilestoneTrophies,
    };

    if (eventMap[eventName]) {
      await eventMap[eventName]();
      res.status(200).send({ message: `Trophée pour l'événement ${eventName} vérifié et attribué.` });
    } else {
      res.status(404).send({ message: `L'événement ${eventName} n'existe pas.` });
    }
  } catch (e) {
    res.status(500).json({ message: 'Route protégée', error: e.message })
  }
});

/* ADMIN - PUT */
router.put('/admin/rewards/:id', authenticateJWT, upload.single('image'), async (req, res) => {
  req.body.type = 'trophy';
  try {
    const reward = await updateReward(req.params.id, req.body, req.file);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du trophée', error: error.message });
  }
});
router.put('/admin/rewards/:id/activate', authenticateJWT, async (req, res) => {
  try {
    const reward = await toggleActivation(req.params.id, req.body.active);
    res.json(reward);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du trophée', error: error.message });
  }
});

/* ADMIN - DELETE */
router.delete('/admin/rewards/:id', authenticateJWT, async (req, res) => {
  try {
    await deleteReward(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du trophée', error: error.message });
  }
});

module.exports = router;
