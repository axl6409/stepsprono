module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id'
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Roles',
        key: 'id',
      },
      field: 'role_id'
    }
  }, {
    tableName: 'UserRoles',
  });

  return UserRole;
};
