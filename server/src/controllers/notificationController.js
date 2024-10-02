const { NotificationSubscription } = require('../models');
const express = require("express");
const { authenticateJWT } = require("../middlewares/auth");
const { sendNotificationsToAll } = require('../services/notificationService');
const router = express.Router();

router.post('/notifications/subscribe', authenticateJWT, async (req, res) => {
  const { endpoint, keys } = req.body;
  const userId = req.user.userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    let subscription = await NotificationSubscription.findOne({ where: { endpoint } });

    if (!subscription) {
      subscription = await NotificationSubscription.create({
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth,
        user_id: userId,
      });
    }

    res.status(201).json({ message: 'Souscription enregistrée avec succès', subscription });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la souscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la souscription' });
  }
});

router.post('/notifications/send', authenticateJWT, async (req, res) => {
  try {
    const message = "Les pronostics sont maintenant fermés !";

    const subscriptions = await NotificationSubscription.findAll();

    await sendNotificationsToAll(subscriptions, message);

    res.status(200).json({ message: 'Notifications envoyées avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des notifications' });
  }
});

module.exports = router;
