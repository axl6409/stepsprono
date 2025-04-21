import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
  getMessagingInstance,
  getToken,
  onMessage,
  vapidKey
} from '../firebase/firebaseConfig';

const NotificationProvider = ({ children }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

  useEffect(() => {
    const setupPush = async () => {
      const messaging = await getMessagingInstance();
      if (!messaging) {
        console.warn('Firebase Messaging non supporté sur ce navigateur');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service worker enregistré :', registration);

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('🚫 Permission refusée');
          return;
        }

        const fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (!fcmToken) {
          console.warn('⚠️ Aucun token FCM reçu');
          return;
        }

        console.log('📬 Token FCM :', fcmToken);

        if (token) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ token: fcmToken }),
          });

          if (!response.ok) {
            console.error('❌ Erreur lors de l\'enregistrement du token FCM');
          } else {
            console.log('✅ Token enregistré avec succès');
          }
        }
      } catch (error) {
        console.error('💥 Erreur setup push :', error);
      }
    };

    if ('serviceWorker' in navigator) {
      setupPush();
    }

    getMessagingInstance().then((messaging) => {
      if (!messaging) return;
      onMessage(messaging, (payload) => {
        console.log('🔔 Notification reçue (foreground) :', payload);
        const { title, body } = payload.notification;
        new Notification(title, {
          body,
          icon: '/img/logo-steps-150x143.png',
        });
      });
    });
  }, [token]);

  return <>{children}</>;
};

export default NotificationProvider;