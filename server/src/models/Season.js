const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Season = sequelize.define('Season', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  winner: {
    type: DataTypes.INT,
    allowNull: true,
  },
});

module.exports = Season;
