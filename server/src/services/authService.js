// server/src/services/authService.js
const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const path = require('path');
const bcrypt = require('bcrypt');

/**
 * Verifies the token using the provided secret key.
 *
 * @param {string} token - The token to verify.
 * @param {string} secretKey - The secret key used for verification.
 * @return {object} The verified token payload.
 */
exports.verifyToken = (token, secretKey) => {
  if (!token) throw new Error('Token manquant');
  return jwt.verify(token, secretKey);
};

/**
 * Check if a user with the provided username or email exists.
 *
 * @param {string} username - The username to check.
 * @param {string} email - The email to check.
 * @return {Promise<User>} A promise that resolves to the existing user or null.
 */
exports.checkUserExists = async (username, email) => {
  const usernameExists = await User.findOne({ where: { username } });
  const emailExists = await User.findOne({ where: { email } });
  return usernameExists || emailExists;
};

/**
 * Processes the profile image by resizing it to multiple dimensions.
 *
 * @param {string} imagePath - The path to the image to process.
 * @return {string} The path to the processed image.
 */
exports.processProfileImage = async (imagePath) => {
  const baseName = path.basename(imagePath, path.extname(imagePath));
  await sharp(imagePath)
    .resize(120, 120)
    .toFile(`${path.dirname(imagePath)}/${baseName}_120x120${path.extname(imagePath)}`);

  await sharp(imagePath)
    .resize(450, 450)
    .toFile(`${path.dirname(imagePath)}/${baseName}_450x450${path.extname(imagePath)}`);

  await sharp(imagePath)
    .resize(450)
    .toFile(`${path.dirname(imagePath)}/${baseName}_450xAuto${path.extname(imagePath)}`);

  return imagePath.split('client')[1];
};

/**
 * Assigns a role to a user and generates a token based on the user's information.
 *
 * @param {User} user - The user to assign the role and generate the token for.
 * @param {string} roleName - The name of the role to assign to the user.
 * @param {string} secretKey - The secret key used for token generation.
 * @return {string} The generated token.
 */
exports.assignRoleAndGenerateToken = async (user, roleName, secretKey) => {
  const [userRole, created] = await Role.findOrCreate({ where: { name: roleName } });
  await user.addRole(userRole);

  const token = jwt.sign({ userId: user.id, role: userRole.name }, secretKey, { expiresIn: '365d' });
  return token;
};

/**
 * Generates a token for a user based on their roles and secret key.
 *
 * @param {User} user - The user for whom the token is generated.
 * @param {string} secretKey - The secret key used for token generation.
 * @return {string} The generated token.
 */
exports.generateTokenForUser = async (user, secretKey) => {
  const userRoles = await user.getRoles();
  const userRole = userRoles && userRoles.length > 0 ? userRoles[0].name : 'user';
  const token = jwt.sign({ userId: user.id, role: userRole }, secretKey, { expiresIn: '365d' });
  return token;
};
