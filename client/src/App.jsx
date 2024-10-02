import React, { useEffect } from "react";
import { UserProvider } from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr';
import moment from "moment";
import { AppProvider } from "./contexts/AppContext.jsx";
import AppContent from "./AppContent.jsx";
import { useCookies } from "react-cookie";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

const App = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token;

  moment.updateLocale('fr', {});

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
      handleForegroundNotifications();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      if (!token) {
        console.error('Token non disponible, impossible d\'envoyer la requête');
        return;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Permission de notification refusée');
        return;
      }

      const messaging = getMessaging(firebaseApp);
      const fcmToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration });

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
          return;
        }
        console.log('Token FCM enregistré avec succès');
      } else {
        console.log('Impossible d\'obtenir le token FCM.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription aux notifications push:', error);
    }
  };

  const handleForegroundNotifications = () => {
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging, (payload) => {
      console.log('Notification reçue au premier plan :', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/img/logo-steps-150x143.png'
      };

      new Notification(notificationTitle, notificationOptions);
    });
  };

  return (
    <UserProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </UserProvider>
  );
};

export default App;
