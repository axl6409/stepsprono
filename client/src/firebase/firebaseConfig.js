// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const firebaseApp = initializeApp(firebaseConfig);

const getMessagingInstance = async () => {
  if (!(await isSupported())) return null;
  return getMessaging(firebaseApp);
};

export {
  firebaseApp,
  vapidKey,
  getMessagingInstance,
  getToken,
  deleteToken,
  onMessage
};
