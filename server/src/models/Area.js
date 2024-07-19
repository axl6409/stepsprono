module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
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
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'areas',
    timestamps: true
  });

  Area.associate = (models) => {
    Area.hasMany(models.Competition, { foreignKey: 'area_id', as: 'Competitions' });
  };

  return Area;
};
