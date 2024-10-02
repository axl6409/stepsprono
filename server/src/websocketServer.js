const WebSocket = require('ws');
const { logEmitter } = require('./utils/logger/logger');
const webpush = require('web-push');

const vapidKeys = {
  publicKey: 'BBQ0lld4HKzAy4qTt7ui7PAfekIvcZK4qexmjcM6awDcoG_WbvQxzp09FXz6PwWJrEBhDk9oX0czGKO8zyArCfU',
  privateKey: 'aCJEMOJFpcCA_Ly8Jfd8xMkzGppXLXfqRRhHJFqqAUk'
};

webpush.setVapidDetails(
  'mailto:alexandre.celier64@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// WebSocket serveur
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('reçu : %s', message);
  });

  logEmitter.on('log', (logMessage) => {
    ws.send(JSON.stringify(logMessage));
  });
});

console.log('Le serveur WebSocket est en cours d\'exécution sur ws://localhost:8080');
