module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
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
  });

  Country.associate = (models) => {
    Country.hasMany(models.Competition, { foreignKey: 'countryId', as: 'Competitions' });
  };

  return Country;
};
