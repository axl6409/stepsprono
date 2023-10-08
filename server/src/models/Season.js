const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Season = sequelize.define('Season', {
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  winner: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Season;
