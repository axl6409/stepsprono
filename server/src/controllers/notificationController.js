const { NotificationSubscription } = require('../models');
const express = require("express");
const axios = require("axios");
const { authenticateJWT } = require("../middlewares/auth");
const { sendNotification } = require("../services/fcmService");
const logger = require("../utils/logger/logger");
const {betsCloseNotification, testNotification} = require("../services/notificationService");
const router = express.Router();
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
const appPublicUrl = process.env.REACT_APP_PUBLIC_URL || 'http://localhost:3000';

router.post('/notifications/subscribe', authenticateJWT, async (req, res) => {
  const { token } = req.body;
  const userId = req.user.userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    let subscription = await NotificationSubscription.findOne({ where: { endpoint: token } });

    if (!subscription) {
      subscription = await NotificationSubscription.create({
        endpoint: token,
        user_id: userId,
      });
    }

    res.status(201).json({ message: 'Souscription enregistrée avec succès', subscription });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la souscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la souscription' });
  }
});

router.post('/notifications/send', async (req, res) => {
  // const { userId, message } = req.body;
  const message = 'message test de notification';
  try {
    const subscription = await NotificationSubscription.findOne({ where: { user_id: 2 } });

    if (!subscription) {
      return res.status(404).json({ error: 'Souscription non trouvée pour cet utilisateur.' });
    }

    await sendNotification(subscription.endpoint, message);

    res.status(200).json({ message: 'Notification envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    logger.error(error.data)
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification' });
  }
});

router.post('/notifications/bets-close', async (req, res) => {
  const { notificationType } = req.body;
  try {
    await betsCloseNotification(notificationType);
    res.status(200).json({ message: 'Notifications programmées avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la programmation des notifications', error });
  }
});

router.post('/notifications/test', async (req, res) => {
  try {
    await testNotification();
    res.status(200).json({ message: 'Notifications programmées avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la programmation des notifications', error });
  }
});

module.exports = router;
