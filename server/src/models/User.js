module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  User.associate = (models) => {
    User.belongsToMany(models.Role, { through: models.UserRole, foreignKey: 'userId' });
    User.hasMany(models.Bet, { foreignKey: 'userId' });
  };

  return User;
};
