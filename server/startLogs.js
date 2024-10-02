const { exec } = require('child_process');

exec('npm run logs', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Erreur : ${stderr}`);
    return;
  }
  console.log(`Sortie : ${stdout}`);
});