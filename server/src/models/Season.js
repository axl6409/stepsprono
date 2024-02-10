const { DataTypes } = require('sequelize');
const sequelize = require('../../database');

const Season = sequelize.define('Season', {
  year: {
    type: DataTypes.INTEGER,
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
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Season;
