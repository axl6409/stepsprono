module.exports = (sequelize, DataTypes) => {
  const Competition = sequelize.define('Competition', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Country',
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
    Competition.belongsTo(models.Country, { foreignKey: 'countryId', as: 'Country' });
    Competition.hasMany(models.Season, { foreignKey: 'competitionId' });
  };

  return Competition;
};
