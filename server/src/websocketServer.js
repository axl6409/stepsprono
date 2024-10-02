const WebSocket = require('ws');
const { logEmitter } = require('./utils/logger/logger');

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
