module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: 'Roles',
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, { through: models.UserRole, foreignKey: 'roleId' });
  };

  return Role;
};
