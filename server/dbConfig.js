const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const getSequelizeInstance = function() {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';

  let sequelize;
  if (isProduction) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
          ca: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')).toString(),
          key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')).toString(),
          cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')).toString()
        }
      },
      define: {
        underscored: true,
        freezeTableName: true,
      }
    });
  } else {
    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      protocol: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: false
      },
      define: {
        underscored: true,
        freezeTableName: true,
      }
    });
  }
  return sequelize;
}

module.exports = getSequelizeInstance;