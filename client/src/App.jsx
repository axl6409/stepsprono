import React, { useEffect } from "react";
import { UserProvider } from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr';
import moment from "moment";
import { AppProvider } from "./contexts/AppContext.jsx";
import AppContent from "./AppContent.jsx";

// Clé publique VAPID (remplacez par votre propre clé publique)
const publicVapidKey = 'BBQ0lld4HKzAy4qTt7ui7PAfekIvcZK4qexmjcM6awDcoG_WbvQxzp09FXz6PwWJrEBhDk9oX0czGKO8zyArCfU';

const App = () => {
  moment.updateLocale('fr', {});

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Enregistrer le Service Worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      // Demander la permission pour recevoir des notifications push
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Permission de notification refusée');
        return;
      }

      // Souscrire aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // Envoyer la souscription au serveur
      await fetch('http://localhost:5000/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Souscription réussie aux notifications push');
    } catch (error) {
      console.error('Erreur lors de l\'inscription aux notifications push:', error);
    }
  };

  // Convertir la clé VAPID en Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
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