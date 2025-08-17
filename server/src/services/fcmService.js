const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
const {NotificationSubscription} = require("../models");
const logger = require("../utils/logger/logger");

async function getAccessToken() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    });
    const accessToken = await auth.getAccessToken();
    logger.info('[sendNotification] AccessToken obtenu:', accessToken);
    return accessToken;
  } catch (error) {
    logger.error('[sendNotification] Erreur lors de l\'obtention du token d\'accès:', error);
  }
}

async function sendNotification(token, title, message) {
  const accessToken = await getAccessToken();

  if (!accessToken) return logger.error('[sendNotification] Empty accessToken var');
  if (!message) return logger.error('[sendNotification] Empty message var');
  if (!title) return logger.error('[sendNotification] Empty title var');
  if (!token) return logger.error('[sendNotification] Empty token var');

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

    logger.info('[sendNotification] Notification envoyée avec succès:', response.data);
  } catch (err) {
    const status = err.response?.status;
    const details = err.response?.data?.error?.details?.[0]?.errorCode;
    if (status === 404 && details === 'UNREGISTERED') {
      await NotificationSubscription.destroy({ where: { endpoint: token } });
      logger.info('[sendNotification] Token supprimé :', token);
    } else {
      logger.error('[sendNotification] Erreur FCM inattendue pour', token, err);
    }
  }
}

const sendNotificationsToAll = async (message) => {
  const subscriptions = await NotificationSubscription.findAll();
  for (const sub of subscriptions) {
    await sendNotification(sub.endpoint, message.title, message.body);
  }
};

const sendNotificationToOne = async (userId, message) => {
  if (!userId) throw new Error('userId manquant pour l’envoi de notification');

  const subscriptions = await NotificationSubscription.findAll({
    where: { user_id: userId }
  });

  if (!subscriptions || subscriptions.length === 0) {
    logger.info(`Aucun abonnement de notification pour l’utilisateur ${userId}`);
    return;
  }

  for (const sub of subscriptions) {
    try {
      await sendNotification(sub.endpoint, message.title, message.body);
    } catch (e) {
      logger.error(`Échec d’envoi de notif à ${sub.endpoint} (user ${userId})`, e);
    }
  }
};

module.exports = {
  sendNotification,
  sendNotificationToOne,
  sendNotificationsToAll
};
