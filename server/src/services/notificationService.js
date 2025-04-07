const { sendNotificationsToAll } = require('./fcmService');
const { fetchWeekMatches } = require('./matchService');
const moment = require('moment');

async function betsCloseNotification(type) {
  try {
    const matches = await fetchWeekMatches(true);
    if (!type) type = 'all';

    if (matches.length > 0) {
      const firstMatch = matches.sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date))[0];
      const firstMatchDate = new Date(firstMatch.utc_date);

      const now = new Date();

      const dayBeforeAt18h = new Date(firstMatchDate);
      dayBeforeAt18h.setDate(dayBeforeAt18h.getDate() - 1);
      dayBeforeAt18h.setHours(18, 0, 0, 0);

      const notificationMessage1 = {
        title: '⏰ Fermeture des pronostics demain ! ',
        body: `N'oublie pas de faire tes pronos avant demain 12h.`,
        icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
      };

      const matchDayAt09h = new Date(firstMatchDate);
      matchDayAt09h.setHours(9, 0, 0, 0);

      const notificationMessage2 = {
        title: '🚨 Fermeture des pronostics dans 3 heures !',
        body: `Attention bandit ! Les pronostics seront fermés dans 3 heures !`,
        icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
      };

      if (type === 'dayBefore' || (type === 'all' && now.getTime() === dayBeforeAt18h.getTime())) {
        await sendNotificationsToAll(notificationMessage1);
        console.log('Notification envoyée pour la veille à 18h.');
      }

      if (type === 'matchDay' || (type === 'all' && now.getTime() === matchDayAt09h.getTime())) {
        await sendNotificationsToAll(notificationMessage2);
        console.log('Notification envoyée pour le jour même à 9h.');
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications de fermeture des pronos :', error);
  }
}

async function testNotification() {
  try {
    const notificationMessage = {
      title: '⏰ Adio bandit ! ',
      body: `C'est une notification test, tout va bien 👌`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };

    await sendNotificationsToAll(notificationMessage);
    console.log('Notification test envoyée.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de test :', error);
  }
}

module.exports = {
  betsCloseNotification,
  testNotification
};
