module.exports = (sequelize, DataTypes) => {
  const Competition = sequelize.define('competition', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Area',
        key: 'id',
      },
      field: 'area_id'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'type'
    },
    emblem: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'emblem'
    },
  });

  Competition.associate = (models) => {
    Competition.belongsTo(models.area, { foreignKey: 'area_id', as: 'Area' });
    Competition.hasMany(models.season, { foreignKey: 'competition_id' });
  };

  return Competition;
};
