const { sendNotificationsToAll, sendNotificationToOne} = require('./fcmService');
const moment = require('moment');
const logger = require("../utils/logger/logger");
const {getCurrentMoment} = require("./logic/dateLogic");

async function betsCloseNotification(type, matches) {
  try {
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

      if (type === 'dayBefore' || (type === 'all' && now.getTime() === dayBeforeAt18h.getTime())) {
        await sendNotificationsToAll(notificationMessage1);
        logger.info('Notification envoyée pour la veille à 18h.');
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
    let bodyText;
    if (homeTeamScore != null && awayTeamScore != null) {
      if (awayTeamScore > homeTeamScore) {
        bodyText = `Match terminé : ${awayTeamName} ${awayTeamScore} - ${homeTeamScore} ${homeTeamName}`;
      } else {
        bodyText = `Match terminé : ${homeTeamName} ${homeTeamScore} - ${awayTeamScore} ${awayTeamName}`;
      }
    } else {
      bodyText = `Match terminé : ${awayTeamName} - ${homeTeamName}`;
    }

    const notificationMessage = {
      title: `🎙️⚽️ Match Terminé !`,
      body:  bodyText,
      icon:  'https://stepsprono.fr/img/logo-steps-150x143.png'
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

async function newContributionNeededNotification(user, amount) {
  try {
    const notificationMessage = {
      title: `💵 Steps d'épargne`,
      body : `tu passes à la banque l'ami ! Tu dois une contribution de ${amount}€ dans la steps d'épargne. A régler avant le ${getCurrentMoment().add(21, 'days').format('DD/MM/YYYY')} !`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };
    await sendNotificationToOne(user.id, notificationMessage);
    logger.info('Notification de contribution requise envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de contribution requise :', error);
  }
}

async function blockedUserNotification(user) {
  try {
    const notificationMessage = {
      title: `⛔️ Tu es bloqué ⛔️`,
      body : `Tu as été bloqué par un administrateur ! Règle tes dettes et tu seras débloqué !`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };
    await sendNotificationToOne(user.id, notificationMessage);
    logger.info('Notification de blocage envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de blocage :', error);
  }
}

async function unlockedUserNotification(user) {
  try {
    const notificationMessage = {
      title: `🚀 Tu es débloqué 🚀️`,
      body : `Tu as été débloqué par un administrateur ! Tu peux maintenant rejouer !`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };
    await sendNotificationToOne(user.id, notificationMessage);
    logger.info('Notification de blocage envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de blocage :', error);
  }
}

async function unruledUserNotification(user) {
  try {
    const notificationMessage = {
      title: `🚀🍀 C'est parti pour la journée spéciale`,
      body : `Bonne chance !`,
      icon: 'https://stepsprono.fr/img/logo-steps-150x143.png'
    };
    await sendNotificationToOne(user.id, notificationMessage);
    logger.info('Notification de journée spéciale envoyée.');
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de la notification de journée spéciale :', error);
  }
}

module.exports = {
  betsCloseNotification,
  testNotification,
  weekEndedNotification,
  matchEndedNotification,
  earnTrophyNotification,
  newContributionNeededNotification,
  blockedUserNotification,
  unlockedUserNotification,
  unruledUserNotification
};
