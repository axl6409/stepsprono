const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));

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


async function sendNotification(token, message) {
  const accessToken = await getAccessToken();

  const payload = {
    message: {
      token: token,
      notification: {
        title: 'Test de notification',
        body: 'Message de test pour la notification push',
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
    console.log('AccessToken:', accessToken);
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

module.exports = {
  sendNotification,
};
