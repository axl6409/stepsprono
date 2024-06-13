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
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Team',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  });

  User.associate = (models) => {
    User.belongsToMany(models.Role, { through: models.UserRole, foreignKey: 'userId' });
    User.hasMany(models.Bet, { foreignKey: 'userId' });
    User.belongsTo(models.Team, { foreignKey: 'teamId', as: 'team' });
  };

  return User;
};
