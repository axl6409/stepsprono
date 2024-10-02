const { NotificationSubscription } = require('../models');
const express = require("express");
const axios = require("axios");
const { authenticateJWT } = require("../middlewares/auth");
const { sendNotificationsToAll } = require('../services/notificationService');
const { sendNotification } = require("../services/fcmService");
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
  try {
    const { token, message } = req.body;

    await sendNotification(token, message);

    res.status(200).json({ message: 'Notification envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des notifications' });
  }
});

module.exports = router;
