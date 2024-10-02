import React, { useEffect } from "react";
import { UserProvider } from "./contexts/UserContext.jsx";
import 'moment/dist/locale/fr';
import moment from "moment";
import { AppProvider } from "./contexts/AppContext.jsx";
import AppContent from "./AppContent.jsx";
import {useCookies} from "react-cookie";
const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

const publicVapidKey = 'BBQ0lld4HKzAy4qTt7ui7PAfekIvcZK4qexmjcM6awDcoG_WbvQxzp09FXz6PwWJrEBhDk9oX0czGKO8zyArCfU';

const App = () => {
  const [cookies] = useCookies(['token']);
  const token = localStorage.getItem('token') || cookies.token

  moment.updateLocale('fr', {});

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      if (!token) {
        console.error('Token non disponible, impossible d\'envoyer la requête');
        return;
      }
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('Permission de notification refusée');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      const response = await fetch(`${apiUrl}/api/notifications/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Erreur lors de l\'inscription aux notifications push');
        return;
      }
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