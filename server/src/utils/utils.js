const multer = require('multer');
const path = require('path');
const { mkdirSync, unlink } = require('fs');

// Fonction pour générer une chaîne aléatoire
function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Configuration de stockage Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const fileType = req.body.type;
    let relativeDest;
    if (fileType === 'profile') {
      relativeDest = path.join('src/assets/uploads/users', (req.params.id || new Date().getTime()).toString());
    } else if (fileType === 'team') {
      relativeDest = path.join('src/assets/uploads/teams', (req.params.id || new Date().getTime()).toString());
    } else if (fileType === 'trophy') {
      relativeDest = path.join('src/assets/uploads/trophies');
    } else {
      relativeDest = path.join('src/assets/uploads/others');
    }
    const absoluteDest = path.join(__dirname, '../../../client', relativeDest);
    try {
      mkdirSync(absoluteDest, { recursive: true });
      console.log(`Dossier créé : ${absoluteDest}`);
      cb(null, absoluteDest);
    } catch (error) {
      console.error(`Erreur lors de la création du dossier : ${error}`);
      cb(error);
    }
  },
  filename: function(req, file, cb) {
    const fileType = req.body.type;
    const randomString = generateRandomString(10);
    if (fileType === 'profile') {
      const userId = req.params.id || new Date().getTime();
      cb(null, 'img_' + userId.toString() + '_' + randomString + path.extname(file.originalname));
    } else if (fileType === 'trophy') {
      const trophyId = req.params.id || new Date().getTime();
      cb(null, 'trophy_' + trophyId.toString() + '_' + randomString + path.extname(file.originalname));
    } else if (fileType === 'team') {
      const teamId = req.params.id || new Date().getTime();
      cb(null, 'team_' + teamId.toString() + '_' + randomString + path.extname(file.originalname));
      console.log('File Name => ', file.originalname);
    } else {
      cb(null, randomString + path.extname(file.originalname));
    }
  }
});

const upload = multer({ storage: storage });

function deleteFile(filePath) {
  unlink(filePath, (err) => {
    if (err) {
      console.error(`Erreur lors de la suppression du fichier : ${err}`);
    } else {
      console.log(`Fichier supprimé : ${filePath}`);
    }
  });
}

function pointsSum(points) {
  return points.reduce((a, b) => a + b, 0);
}

function extractMatchday(round) {
  const match = round.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}


module.exports = {
  generateRandomString,
  upload,
  deleteFile,
  pointsSum,
  extractMatchday
};
