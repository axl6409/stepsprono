module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'username'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'email'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password'
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'img'
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Team',
        key: 'id'
      },
      field: 'team_id'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'status'
    }
  });

  User.associate = (models) => {
    User.belongsToMany(models.role, { through: models.user_role, foreignKey: 'user_id' });
    User.hasMany(models.bet, { foreignKey: 'user_id' });
    User.belongsTo(models.team, { foreignKey: 'team_id', as: 'team' });
  };

  return User;
};
