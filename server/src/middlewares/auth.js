const jwt = require("jsonwebtoken");
const { User } = require('../models');
const logger = require("../utils/logger/logger");

const secretKey = process.env.SECRET_KEY


/**
 * Authenticates the request using a JSON Web Token (JWT) in the Authorization header.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object|undefined} The response object with an error message if the token is missing or invalid, otherwise it calls the next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token is missing from Authorization header' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      let errorMsg = 'Invalid token';
      if (err.name === 'TokenExpiredError') errorMsg = 'Token has expired';
      return res.status(403).json({ error: errorMsg });
    }

    req.user = user;

    next();
  });
};

/**
 * Checks if the user making the request is an admin. If the user is an admin,
 * it calls the next middleware function. Otherwise, it returns a JSON response
 * with a 403 status code and a message indicating that the user is not authorized
 * to access the resource.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object|undefined} The response object with an error message if the user is not an admin, otherwise it calls the next middleware function.
 */
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès interdit : Vous devez être administrateur pour accéder à cette ressource.' });
};

const checkTreasurer = (req, res, next) => {
  if (req.user && (req.user.role === 'treasurer' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Accès interdit : Vous devez être administrateur ou trésorier pour accéder à cette ressource.' });
};

const checkManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Accès interdit : Vous devez être administrateur ou manager pour accéder à cette ressource.' });
};

const checkManagerTreasurer = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin' || req.user.role === 'treasurer')) {
    return next();
  }
  return res.status(403).json({ message: 'Accès interdit : Vous devez être administrateur ou manager pour accéder à cette ressource.' });
};

const updateLastConnected = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await User.update({ last_connected: new Date() }, { where: { id: userId } });
    next();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la date de dernière connexion :", error);
    next();
  }
};

module.exports = {
  authenticateJWT,
  checkAdmin,
  checkTreasurer,
  checkManager,
  checkManagerTreasurer,
  updateLastConnected
};