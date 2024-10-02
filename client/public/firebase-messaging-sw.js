importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "api_key",
  authDomain: "firebase.app.com",
  databaseURL: "https://app.firebasedatabase.app",
  projectId: "firebaseProjectId",
  storageBucket: "project.appspot.com",
  messagingSenderId: "000000",
  appId: " ",
  measurementId: " "
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Message reçu en arrière-plan :', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/logo-steps-150x143.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
