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


module.exports = {
  sendNotification,
};
