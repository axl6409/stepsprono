module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'name'
    }
  });

  Role.associate = (models) => {
    Role.belongsToMany(models.user, { through: models.user_role, foreignKey: 'role_id' });
  };

  return Role;
};
