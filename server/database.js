const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

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
    }
  });
}

module.exports = sequelize;
