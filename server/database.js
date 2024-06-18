const { Sequelize } = require('sequelize');
const config = require('./config/config'); // Charger la configuration

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

let sequelize;

if (isProduction) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      underscored: true,
      freezeTableName: true,
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  const dbConfig = config[env];
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    protocol: 'postgres',
    dialectOptions: {
      ssl: false
    },
    define: {
      underscored: false,
      freezeTableName: false,
    },
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

module.exports = sequelize;