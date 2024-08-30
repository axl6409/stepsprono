require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const env = process.env.NODE_ENV;
const isProduction = env === 'production';
let sequelize;

const getSequelizeInstance = function() {
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
        ssl: {
          require: false
        }
      },
      define: {
        underscored: true,
        freezeTableName: true,
      }
    });
  }
  console.log("Sequelize instance created");
  return sequelize;
}

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    define: {
      underscored: true,
      freezeTableName: true,
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')).toString(),
      }
    },
    define: {
      underscored: true,
      freezeTableName: true,
    }
  }
};

module.exports = {getSequelizeInstance, config};