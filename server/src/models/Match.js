const { DataTypes } = require('sequelize');
const sequelize = require('../../database');
const { Team } = require('./Team');
const { Area } = require('./Area');
const { Competition } = require('./Competition');
const { Season } = require('./Season');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  utcDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  matchday: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  group: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  homeTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id'
    }
  },
  awayTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Team,
      key: 'id'
    }
  },
  areaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Area,
      key: 'id'
    }
  },
  competitionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Competition,
      key: 'id'
    }
  },
  seasonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Season,
      key: 'id'
    }
  },
  winner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scoreFullTimeHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreFullTimeAway: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreHalfTimeHome: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  scoreHalfTimeAway: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
})

module.exports = Match