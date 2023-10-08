const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Area = sequelize.define('Area', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Area;
