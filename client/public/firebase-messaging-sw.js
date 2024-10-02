importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyA4ZGPpE3MK5FYM1Se50f7kUI3h4kLXtSI",
  authDomain: "stepsprono.firebaseapp.com",
  databaseURL: "https://stepsprono-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stepsprono",
  storageBucket: "stepsprono.appspot.com",
  messagingSenderId: "86708555549",
  appId: "1:86708555549:web:28ee4bee59ea7a8eb35bf4",
  measurementId: "G-BMGKPV8DX7"
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
