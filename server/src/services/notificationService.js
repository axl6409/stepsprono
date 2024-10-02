const axios = require('axios');

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

const sendNotification = async (subscription, notification) => {
  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
      to: subscription.endpoint,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/path/to/icon.png',
      }
    }, {
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Notification envoyée avec succès', response.data);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
};

const sendNotificationsToAll = async (subscriptions, message) => {
  const payload = {
    title: 'Pronostics fermés',
    body: message,
    icon: '/path/to/icon.png'
  };

  const validSubscriptions = subscriptions.filter(sub => sub.keys_p256dh && sub.keys_auth);

  if (validSubscriptions.length === 0) {
    console.log('Aucune souscription valide trouvée');
    return;
  }

  for (const subscription of validSubscriptions) {
    await sendNotification(subscription, payload);
  }
};

module.exports = {
  sendNotification,
  sendNotificationsToAll
};
