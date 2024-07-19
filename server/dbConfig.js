const { Sequelize } = require('sequelize');

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
          rejectUnauthorized: false
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
        underscored: false,
        freezeTableName: false,
      }
    });
  }
  return sequelize;
}

module.exports = getSequelizeInstance;
