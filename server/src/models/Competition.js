module.exports = (sequelize, DataTypes) => {
  const Competition = sequelize.define('Competition', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
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
    Competition.hasMany(models.Season, { foreignKey: 'competitionId' });
  };

  return Competition;
};
