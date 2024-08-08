const path = require("path");
const axios = require("axios");
const fs = require("fs");

function getRelativePath(pathToFile) {
  const basePath = path.join(__dirname, '../../../client');
  return pathToFile.replace(basePath, '');
}

async function downloadImage(url, teamId, imageType) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    const extension = url.split('.').pop();
    const fileName = `${imageType}_${teamId}.${extension}`;
    const dir = path.join(__dirname, `../../../client/src/assets/uploads/teams/${teamId}`);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    const pathToFile = path.join(dir, fileName);
    const writer = fs.createWriteStream(pathToFile);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(getRelativePath(pathToFile)));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
  }
}

module.exports = {
  downloadImage,
};