const getSequelizeInstance = require('./dbConfig');
const sequelize = getSequelizeInstance();

module.exports = sequelize;