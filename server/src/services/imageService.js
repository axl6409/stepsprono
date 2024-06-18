const path = require("path");
const axios = require("axios");
const fs = require("fs");

/**
 * Generates the relative path of a file based on a given path.
 *
 * @param {string} pathToFile - The full path of the file.
 * @return {string} The relative path of the file.
 */
function getRelativePath(pathToFile) {
  const basePath = path.join(__dirname, '../../../client');
  return pathToFile.replace(basePath, '');
}

/**
 * Downloads an image from a URL, saves it to a specified directory, and returns a promise that resolves with the relative path of the saved image file.
 *
 * @param {string} url - The URL of the image to download.
 * @param {string} teamId - The ID of the team associated with the image.
 * @param {string} imageType - The type of the image.
 * @return {Promise<string>} A promise that resolves with the relative path of the saved image file.
 */
async function downloadImage(url, teamId, imageType) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    const extension = url.split('.').pop();
    const fileName = `${imageType}_${teamId}.${extension}`;
    const dir = path.join(__dirname, `../../../client/src/assets/teams/${teamId}`);
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