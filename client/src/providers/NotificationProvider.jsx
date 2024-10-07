import React, { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useCookies } from 'react-cookie';

const NotificationProvider = ({ children }) => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

  useEffect(() => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Initialiser Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const messaging = getMessaging(firebaseApp);

    const registerServiceWorkerAndSubscribe = async () => {
      try {
        if (!token) {
          console.error('Token d\'authentification non disponible');
          return;
        }

        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker enregistré avec succès :', registration);

        // Demander la permission pour les notifications
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.error('Permission de notification refusée');
          return;
        }

        const fcmToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });

        if (fcmToken) {
          console.log('Token FCM reçu : ', fcmToken);

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            body: JSON.stringify({ token: fcmToken }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            console.error('Erreur lors de l\'inscription aux notifications push');
          } else {
            console.log('Token FCM enregistré avec succès');
          }
        } else {
          console.log('Impossible d\'obtenir le token FCM.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du service worker ou de l\'obtention du token FCM :', error);
      }
    };

    if ('serviceWorker' in navigator) {
      registerServiceWorkerAndSubscribe();
    }

    onMessage(messaging, (payload) => {
      console.log('Notification reçue au premier plan :', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/img/logo-steps-150x143.png'
      };

      new Notification(notificationTitle, notificationOptions);
    });
  }, [token]);

  return <>{children}</>;
};

export default NotificationProvider;
