const { google } = require('googleapis');
const axios = require('axios');
const path = require('path');
const serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const accessToken = await auth.getAccessToken();
  return accessToken;
}


async function sendNotification(token, message) {
  const accessToken = await getAccessToken();

  const payload = {
    to: token,
    notification: {
      title: 'Test de notification',
      body: message,
      icon: 'http://localhost:3000/img/logo-steps-150x143.png',
    },
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

module.exports = {
  sendNotification,
};
