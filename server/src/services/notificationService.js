const { sendNotificationsToAll } = require('./fcmService');
const { fetchWeekMatches } = require('./matchService');
const { schedule } = require("node-schedule");
const moment = require('moment');
const logger = require("../utils/logger/logger");
const {createTask} = require("./taskService");

async function betsCloseNotification(type, action) {
  try {
    const matches = await fetchWeekMatches();
    if (!type) type = 'all';
    if (!action) action = 'schedule';

    if (matches.length > 0) {
      const firstMatch = matches.sort((a, b) => new Date(a.utc_date) - new Date(b.utc_date))[0];
      const firstMatchDate = new Date(firstMatch.utc_date);

      const dayBeforeAt18h = new Date(firstMatchDate);
      dayBeforeAt18h.setDate(dayBeforeAt18h.getDate() - 1);
      dayBeforeAt18h.setHours(18, 0, 0);

      const notificationMessage1 = {
        title: '⏰ Fermeture des pronostics demain ! ',
        body: `N'oublie pas de faire tes pronos avant demain 12h.`,
        icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
      };

      const matchDayAt09h = new Date(firstMatchDate);
      matchDayAt09h.setHours(9, 0, 0);

      const notificationMessage2 = {
        title: '🚨 Fermeture des pronostics dans 3 heures !',
        body: `Attention bandit ! Les pronostics seront fermés dans 3 heures !`,
        icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
      };

      if (action === 'schedule') {
        if (type === 'dayBefore' || type === 'all') {
          await createTask('dayBefore', dayBeforeAt18h, async () => {
            await sendNotificationsToAll(notificationMessage1);
            logger.info('[NOTIF] Notification planifiée envoyée pour la veille à 18h.');
          });
        }
        if (type === 'matchDay' || type === 'all') {
          await createTask('matchDay', matchDayAt09h, async () => {
            await sendNotificationsToAll(notificationMessage2);
            logger.info('Notification planifiée envoyée pour le jour du match à 9h.');
          });
        }
        logger.info('Les notifications ont été planifiées.');
      } else if (action === 'trigger') {
        if (type === 'dayBefore') {
          await sendNotificationsToAll(notificationMessage1);
          logger.info('[NOTIF] Notification immédiate envoyée pour la veille à 18h.');
        }
        if (type === 'matchDay') {
          await sendNotificationsToAll(notificationMessage2);
          logger.info('[NOTIF] Notification immédiate envoyée pour le jour du match à 9h.');
        }
        if (type === 'all') {
          await sendNotificationsToAll(notificationMessage1);
          await sendNotificationsToAll(notificationMessage2);
          logger.info('[NOTIF] Notifications immédiates envoyées pour la veille à 18h et le jour du match à 9h.');
        }
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
