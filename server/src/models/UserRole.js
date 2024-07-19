module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Roles',
        key: 'id',
      }
    }
  }, {
    tableName: 'UserRoles',
  });

  return UserRole;
};
