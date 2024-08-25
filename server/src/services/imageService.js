const path = require("path");
const axios = require("axios");
const fs = require("fs");

/**
 * Returns the relative path of a given file path relative to the client directory.
 *
 * @param {string} pathToFile - The absolute path of the file.
 * @return {string} The relative path of the file relative to the client directory.
 */
function getRelativePath(pathToFile) {
  const basePath = path.join(__dirname, '../../../client');
  return pathToFile.replace(basePath, '');
}

/**
 * Downloads an image from the given URL and saves it to a specific directory with a generated file name.
 *
 * @param {string} url - The URL of the image to download.
 * @param {string} teamId - The ID of the team associated with the image.
 * @param {string} imageType - The type of the image (e.g., logo, avatar).
 * @return {Promise<string>} A promise that resolves to the relative path of the downloaded image.
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