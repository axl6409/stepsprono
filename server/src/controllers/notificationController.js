const { NotificationSubscription } = require('../models');
const { User } = require('../models');
const express = require("express");
const {authenticateJWT} = require("../middlewares/auth");
const {sendNotification} = require("web-push");
const router = express.Router()

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
})

router.post('/notifications/send', authenticateJWT, async (req, res) => {
  try {
    const message = "Les pronostics sont maintenant fermés !"; // Message à envoyer

    // Récupérer toutes les souscriptions
    const subscriptions = await NotificationSubscription.findAll();

    // Filtrer les souscriptions qui ont les clés p256dh et auth
    const validSubscriptions = subscriptions.filter(sub => sub.keys_p256dh && sub.keys_auth);

    if (validSubscriptions.length === 0) {
      return res.status(400).json({ message: 'Aucune souscription valide trouvée pour l\'envoi de la notification.' });
    }

    // Envoyer une notification à chaque souscription valide
    validSubscriptions.forEach(subscription => {
      const payload = JSON.stringify({
        title: 'Pronostics fermés',
        body: message,
        icon: '/path/to/icon.png'
      });

      sendNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys_p256dh,
          auth: subscription.keys_auth
        }
      }, payload)
        .then(() => console.log('Notification envoyée avec succès'))
        .catch(err => console.error('Erreur lors de l\'envoi de la notification:', err));
    });

    res.status(200).json({ message: 'Notifications envoyées avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des notifications' });
  }
})

module.exports = router