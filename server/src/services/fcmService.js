const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
const {NotificationSubscription} = require("../models");

async function getAccessToken() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    });
    const accessToken = await auth.getAccessToken();
    console.log('AccessToken obtenu:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token d\'accès:', error);
  }
}

async function sendNotification(token, title, message) {
  const accessToken = await getAccessToken();

  if (!accessToken) return console.error('Empty accessToken var');
  if (!message) return console.error('Empty message var');
  if (!title) return console.error('Empty title var');
  if (!token) return console.error('Empty token var');

  const payload = {
    message: {
      token: token,
      notification: {
        title: title,
        body: message,
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          icon: 'https://stepsprono.fr/img/logo-steps-150x143.png',
        }
      }
    }
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/v1/projects/stepsprono/messages:send', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Notification envoyée avec succès:', response.data);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
}

const sendNotificationsToAll = async (message) => {
  const subscriptions = await NotificationSubscription.findAll();
  for (const subscription of subscriptions) {
    await sendNotification(subscription.endpoint, message.title, message.body);
  }
};

const sendNotificationToOne = async (userId, message) => {
  const subscription = await NotificationSubscription.findAll({
    where: {
      user_id: userId,
    }
  })
  await sendNotification(subscription.endpoint, message.title, message.body)
}

module.exports = {
  sendNotification,
  sendNotificationToOne,
  sendNotificationsToAll
};
