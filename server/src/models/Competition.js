module.exports = (sequelize, DataTypes) => {
  const Competition = sequelize.define('Competition', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    areaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Area',
        key: 'code',
      }
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

  Competition.associate = (models) => {
    Competition.belongsTo(models.Area, { foreignKey: 'areaId', as: 'Area' });
    Competition.hasMany(models.Season, { foreignKey: 'competitionId' });
  };

  return Competition;
};
