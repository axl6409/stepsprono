const { sendNotificationsToAll, sendNotificationToOne} = require('./fcmService');
const { fetchWeekMatches } = require('./matchService');
const moment = require('moment');
const logger = require("../utils/logger/logger");

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
        logger.info('Notification envoyée pour la veille à 18h.');
      }

      if (type === 'matchDay' || (type === 'all' && now.getTime() === matchDayAt09h.getTime())) {
        await sendNotificationsToAll(notificationMessage2);
        logger.info('Notification envoyée pour le jour même à 9h.');
      }
    }
  } catch (error) {
    logger.error('Erreur lors de l\'envoi des notifications de fermeture des pronos :', error);
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
    logger.info('Notification test envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de test :', error);
  }
}

async function weekEndedNotification() {
  try {
    const notificationMessage = {
      title: `📢 C'est fini ! `,
      body: `Consulte tes points et ton classement de la semaine sur l'appli StepsProno !`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };

    await sendNotificationsToAll(notificationMessage);
    logger.info('Notification de fin de semaine envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de fin de semaine :', error);
  }
}

async function matchEndedNotification(homeTeamName, awayTeamName, homeTeamScore = null, awayTeamScore = null) {
  try {
    const notificationMessage = {
      title: `🎙️⚽️ Match Terminé ! `,
      body : {
        title: () => {
          if (homeTeamScore && awayTeamScore) {
            if (awayTeamScore > homeTeamScore) {
              return `Match terminé : ${awayTeamName} ${awayTeamScore} - ${homeTeamScore} ${homeTeamName}`;
            }
            return `Match terminé : ${homeTeamName} ${homeTeamScore} - ${awayTeamScore} ${awayTeamName}`;
          } else {
            return `Match terminé : ${awayTeamName} - ${homeTeamName}`;
          }
        }
      },
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };
    await sendNotificationsToAll(notificationMessage);
    logger.info('Notification de fin de match envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de fin de match :', error);
  }
}

async function earnTrophyNotification(user, trophyName) {
  try {
    const notificationMessage = {
      title: `🏅 Nouveau badge gagné !`,
      body : `Adio ${user.username} ! tu as remporté le badge ${trophyName}`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };
    await sendNotificationToOne(user.id, notificationMessage);
    logger.info('Notification de badge gagné '+ trophyName +' pour l\'utilisateur '+ user.username +' envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de badge '+ trophyName +' gagné pour '+ user.username +' :', error);
  }
}

module.exports = {
  betsCloseNotification,
  testNotification,
  weekEndedNotification,
  matchEndedNotification,
  earnTrophyNotification
};
