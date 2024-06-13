const multer = require('multer');
const path = require('path');
const { mkdirSync } = require('fs');

// Fonction pour générer une chaîne aléatoire
function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Configuration de stockage Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const userId = req.params.id || new Date().getTime();
    const dest = path.join(__dirname, '../../client/src/assets/uploads/users/', userId.toString());
    try {
      mkdirSync(dest, { recursive: true });
      console.log(`Dossier créé : ${dest}`);
      cb(null, dest);
    } catch (error) {
      console.error(`Erreur lors de la création du dossier : ${error}`);
      cb(error);
    }
  },
  filename: function(req, file, cb) {
    const randomString = generateRandomString(10);
    const userId = req.params.id || new Date().getTime();
    cb(null, 'pp_img_' + userId.toString() + '_' + randomString + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

function pointsSum(points) {
  return points.reduce((a, b) => a + b, 0);
}

module.exports = {
  generateRandomString,
  upload,
  pointsSum
};
