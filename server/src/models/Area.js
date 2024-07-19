module.exports = (sequelize, DataTypes) => {
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
  }, {
    tableName: 'Areas',
  });

  Area.associate = (models) => {
    Area.hasMany(models.Competition, { foreignKey: 'areaId', as: 'Competitions' });
  };

  return Area;
};
