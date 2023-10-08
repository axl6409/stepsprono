const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Competition = sequelize.define('Competition', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
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
