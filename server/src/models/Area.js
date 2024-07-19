module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('area', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'code'
    },
    flag: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'flag'
    },
  });

  Area.associate = (models) => {
    Area.hasMany(models.competition, { foreignKey: 'area_id', as: 'competitions' });
  };

  return Area;
};
