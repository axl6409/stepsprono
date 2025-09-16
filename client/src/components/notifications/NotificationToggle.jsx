import React, { useEffect, useState } from 'react';
import {
  getMessagingInstance,
  getToken,
  deleteToken,
  vapidKey
} from '../../firebase/firebaseConfig';
import CustomToggle from "../buttons/JoystickButton.jsx";

const NotificationToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        setEnabled(data.subscribed);
      } catch (err) {
        console.error('Erreur lors du chargement du statut de souscription :', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [token]);

  const handleToggle = async () => {
    setLoading(true);
    const messaging = await getMessagingInstance();
    if (!messaging) return setLoading(false);

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      if (!enabled) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('Permission refusée');

        const fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration
        });

        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token: fcmToken })
        });

        setEnabled(true);
      } else {
        const currentToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration
        });

        await deleteToken(messaging);

        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token: currentToken })
        });

        setEnabled(false);
      }
    } catch (error) {
      console.error('Erreur de gestion des notifications :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomToggle
      checked={enabled}
      onChange={handleToggle}
      disabled={loading}
      label={enabled ? 'Notifications activées' : 'Notifications désactivées'}
      mode="toggle"
    />
  );
};

export default NotificationToggle;