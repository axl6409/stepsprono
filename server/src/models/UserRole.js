/**
 * Defines the UserRole model for the sequelize ORM.
 *
 * @param {Object} sequelize - The sequelize instance.
 * @param {Object} DataTypes - The data types provided by sequelize.
 * @return {Object} The UserRole model.
 */
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id'
    },
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Roles',
        key: 'id',
      },
      field: 'role_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'user_roles',
    timestamps: true
  });

  return UserRole;
};
