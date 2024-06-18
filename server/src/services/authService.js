// server/src/services/authService.js
const { User, Role } = require('../models');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const path = require('path');
const bcrypt = require('bcrypt');

exports.verifyToken = (token, secretKey) => {
  if (!token) throw new Error('Token manquant');
  return jwt.verify(token, secretKey);
};

exports.checkUserExists = async (username, email) => {
  const usernameExists = await User.findOne({ where: { username } });
  const emailExists = await User.findOne({ where: { email } });
  return usernameExists || emailExists;
};

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

exports.assignRoleAndGenerateToken = async (user, roleName, secretKey) => {
  const [userRole, created] = await Role.findOrCreate({ where: { name: roleName } });
  await user.addRole(userRole);

  const token = jwt.sign({ userId: user.id, role: userRole.name }, secretKey, { expiresIn: '365d' });
  return token;
};

exports.generateTokenForUser = async (user, secretKey) => {
  const userRoles = await user.getRoles();
  const userRole = userRoles && userRoles.length > 0 ? userRoles[0].name : 'user';
  const token = jwt.sign({ userId: user.id, role: userRole }, secretKey, { expiresIn: '365d' });
  return token;
};
