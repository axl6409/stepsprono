const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Competition = sequelize.define('Competition', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emblem: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Competition;
